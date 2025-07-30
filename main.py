"""
Financial Insights App - Dagger Module

A comprehensive Dagger module for financial analysis and QuickBooks integration.
Designed for small to mid-sized accounting firms.
"""

import dagger
from dagger import dag, function, object_type
from typing import Optional


@object_type
class FinancialInsights:
    """Main Dagger module for financial insights and QuickBooks integration."""

    @function
    async def quickbooks_connector(
        self,
        client_id: str,
        client_secret: dagger.Secret,
        company_id: str,
        sandbox: bool = True
    ) -> dagger.Container:
        """
        Create a container configured for QuickBooks API access.
        
        Args:
            client_id: QuickBooks App Client ID
            client_secret: QuickBooks App Client Secret (as Dagger Secret)
            company_id: QuickBooks Company ID
            sandbox: Whether to use sandbox environment (default: True)
        """
        return (
            dag.container()
            .from_("python:3.11-slim")
            .with_workdir("/app")
            .with_exec(["pip", "install", "requests", "python-dotenv", "intuitlib"])
            .with_env_variable("QB_CLIENT_ID", client_id)
            .with_secret_variable("QB_CLIENT_SECRET", client_secret)
            .with_env_variable("QB_COMPANY_ID", company_id)
            .with_env_variable("QB_SANDBOX", str(sandbox))
        )

    @function
    async def fetch_financial_data(
        self,
        qb_container: dagger.Container,
        data_type: str = "all"
    ) -> str:
        """
        Fetch financial data from QuickBooks.
        
        Args:
            qb_container: Container with QuickBooks API configuration
            data_type: Type of data to fetch ('all', 'accounts', 'transactions', etc.)
        """
        python_script = """
import os
import requests
import json
from datetime import datetime, timedelta

def fetch_qb_data():
    # This is a placeholder for actual QuickBooks API integration
    # In production, you'd use proper OAuth flow and API calls
    
    data_type = os.environ.get('DATA_TYPE', 'all')
    company_id = os.environ.get('QB_COMPANY_ID')
    
    # Mock data structure for development
    mock_data = {
        'accounts': [
            {'id': '1', 'name': 'Checking Account', 'balance': 25000.00},
            {'id': '2', 'name': 'Accounts Receivable', 'balance': 15000.00},
            {'id': '3', 'name': 'Revenue', 'balance': -50000.00}
        ],
        'transactions': [
            {'date': '2024-01-15', 'amount': 1500.00, 'description': 'Client Payment'},
            {'date': '2024-01-14', 'amount': -500.00, 'description': 'Office Supplies'}
        ],
        'company_info': {
            'company_id': company_id,
            'name': 'Sample Accounting Firm',
            'fiscal_year_start': '2024-01-01'
        }
    }
    
    if data_type == 'all':
        return json.dumps(mock_data, indent=2)
    else:
        return json.dumps(mock_data.get(data_type, {}), indent=2)

if __name__ == '__main__':
    result = fetch_qb_data()
    print(result)
"""
        
        return await (
            qb_container
            .with_env_variable("DATA_TYPE", data_type)
            .with_new_file("/app/fetch_data.py", python_script)
            .with_exec(["python", "/app/fetch_data.py"])
            .stdout()
        )

    @function
    async def calculate_kpis(
        self,
        financial_data: str
    ) -> str:
        """
        Calculate key financial KPIs from the provided data.
        
        Args:
            financial_data: JSON string containing financial data
        """
        kpi_script = """
import json
import sys
from datetime import datetime

def calculate_financial_kpis(data_str):
    try:
        data = json.loads(data_str)
        
        # Extract accounts data
        accounts = data.get('accounts', [])
        transactions = data.get('transactions', [])
        
        # Calculate basic KPIs
        checking_balance = next((acc['balance'] for acc in accounts if 'Checking' in acc['name']), 0)
        ar_balance = next((acc['balance'] for acc in accounts if 'Receivable' in acc['name']), 0)
        revenue = abs(next((acc['balance'] for acc in accounts if 'Revenue' in acc['name']), 0))
        
        # Calculate transaction-based metrics
        total_payments = sum(t['amount'] for t in transactions if t['amount'] > 0)
        total_expenses = abs(sum(t['amount'] for t in transactions if t['amount'] < 0))
        
        kpis = {
            'cash_position': {
                'checking_account_balance': checking_balance,
                'accounts_receivable': ar_balance,
                'total_liquid_assets': checking_balance + ar_balance
            },
            'revenue_metrics': {
                'total_revenue': revenue,
                'recent_payments': total_payments,
                'payment_velocity': total_payments / max(len(transactions), 1)
            },
            'expense_metrics': {
                'recent_expenses': total_expenses,
                'expense_ratio': total_expenses / max(revenue, 1) if revenue > 0 else 0
            },
            'profitability': {
                'gross_profit': revenue - total_expenses,
                'profit_margin': ((revenue - total_expenses) / revenue * 100) if revenue > 0 else 0
            },
            'calculated_at': datetime.now().isoformat()
        }
        
        return json.dumps(kpis, indent=2)
        
    except Exception as e:
        return json.dumps({'error': str(e)})

# Read data from stdin or use sample data
data_input = sys.stdin.read() if not sys.stdin.isatty() else '""" + financial_data.replace('"', '\\"') + """'

result = calculate_financial_kpis(data_input)
print(result)
"""
        
        return await (
            dag.container()
            .from_("python:3.11-slim")
            .with_workdir("/app")
            .with_new_file("/app/calculate_kpis.py", kpi_script)
            .with_exec(["python", "/app/calculate_kpis.py"])
            .stdout()
        )

    @function
    async def generate_insights_report(
        self,
        kpi_data: str,
        client_name: str = "Sample Client"
    ) -> dagger.File:
        """
        Generate a financial insights report based on KPI data.
        
        Args:
            kpi_data: JSON string containing calculated KPIs
            client_name: Name of the client for the report
        """
        report_script = f"""
import json
import sys
from datetime import datetime

def generate_report(kpi_str, client_name):
    try:
        kpis = json.loads(kpi_str)
        
        report = f'''
# Financial Insights Report
**Client:** {client_name}
**Generated:** {{datetime.now().strftime("%Y-%m-%d %H:%M:%S")}}

## Executive Summary
This report provides key financial insights based on your QuickBooks data.

## Cash Position Analysis
- **Checking Account Balance:** ${{kpis.get('cash_position', {{}}).get('checking_account_balance', 0):,.2f}}
- **Accounts Receivable:** ${{kpis.get('cash_position', {{}}).get('accounts_receivable', 0):,.2f}}
- **Total Liquid Assets:** ${{kpis.get('cash_position', {{}}).get('total_liquid_assets', 0):,.2f}}

## Revenue Performance
- **Total Revenue:** ${{kpis.get('revenue_metrics', {{}}).get('total_revenue', 0):,.2f}}
- **Recent Payments:** ${{kpis.get('revenue_metrics', {{}}).get('recent_payments', 0):,.2f}}
- **Payment Velocity:** ${{kpis.get('revenue_metrics', {{}}).get('payment_velocity', 0):,.2f}} per transaction

## Profitability Analysis
- **Gross Profit:** ${{kpis.get('profitability', {{}}).get('gross_profit', 0):,.2f}}
- **Profit Margin:** {{kpis.get('profitability', {{}}).get('profit_margin', 0):,.1f}}%

## Key Insights & Recommendations

### Strengths
- Positive cash flow from operations
- Healthy accounts receivable balance

### Areas for Improvement
- Monitor expense ratios for optimization opportunities
- Consider implementing automated payment reminders

### Next Steps
1. Review expense categories for cost reduction opportunities
2. Analyze client payment patterns
3. Consider cash flow forecasting for better planning

---
*Report generated by Financial Insights App powered by Dagger*
'''
        
        return report
        
    except Exception as e:
        return f"Error generating report: {{str(e)}}"

# Process the KPI data
kpi_input = '{kpi_data}'
report_content = generate_report(kpi_input, "{client_name}")
print(report_content)
"""
        
        container = (
            dag.container()
            .from_("python:3.11-slim")
            .with_workdir("/app")
            .with_new_file("/app/generate_report.py", report_script)
            .with_exec(["python", "/app/generate_report.py"])
        )
        
        return container.file("/dev/stdout")

    @function
    async def build_dashboard_data(
        self,
        kpi_data: str
    ) -> str:
        """
        Transform KPI data into format suitable for dashboard consumption.
        
        Args:
            kpi_data: JSON string containing calculated KPIs
        """
        dashboard_script = """
import json
import sys
from datetime import datetime, timedelta

def build_dashboard_data(kpi_str):
    try:
        kpis = json.loads(kpi_str)
        
        # Transform data for dashboard widgets
        dashboard_data = {
            'widgets': {
                'cash_flow_summary': {
                    'type': 'metric_card',
                    'title': 'Cash Position',
                    'value': kpis.get('cash_position', {}).get('total_liquid_assets', 0),
                    'format': 'currency',
                    'trend': 'positive'  # This would be calculated from historical data
                },
                'profit_margin': {
                    'type': 'metric_card', 
                    'title': 'Profit Margin',
                    'value': kpis.get('profitability', {}).get('profit_margin', 0),
                    'format': 'percentage',
                    'trend': 'neutral'
                },
                'revenue_chart': {
                    'type': 'line_chart',
                    'title': 'Revenue Trend',
                    'data': [
                        {'date': '2024-01-01', 'value': 45000},
                        {'date': '2024-01-15', 'value': 50000},
                        {'date': '2024-01-30', 'value': kpis.get('revenue_metrics', {}).get('total_revenue', 0)}
                    ]
                },
                'expense_breakdown': {
                    'type': 'pie_chart',
                    'title': 'Expense Categories',
                    'data': [
                        {'category': 'Operations', 'value': 15000},
                        {'category': 'Marketing', 'value': 5000},
                        {'category': 'Other', 'value': kpis.get('expense_metrics', {}).get('recent_expenses', 0)}
                    ]
                }
            },
            'alerts': [
                {
                    'type': 'info',
                    'message': f"Cash position is healthy at ${kpis.get('cash_position', {}).get('total_liquid_assets', 0):,.2f}",
                    'priority': 'low'
                }
            ],
            'last_updated': datetime.now().isoformat()
        }
        
        return json.dumps(dashboard_data, indent=2)
        
    except Exception as e:
        return json.dumps({'error': str(e)})

# Process the KPI data
kpi_input = '""" + kpi_data.replace("'", "\\'") + """'
result = build_dashboard_data(kpi_input)
print(result)
"""
        
        return await (
            dag.container()
            .from_("python:3.11-slim")
            .with_workdir("/app")
            .with_new_file("/app/build_dashboard.py", dashboard_script)
            .with_exec(["python", "/app/build_dashboard.py"])
            .stdout()
        )

    @function
    async def run_full_analysis(
        self,
        client_id: str,
        client_secret: dagger.Secret,
        company_id: str,
        client_name: str = "Sample Client"
    ) -> str:
        """
        Run the complete financial analysis pipeline.
        
        Args:
            client_id: QuickBooks App Client ID
            client_secret: QuickBooks App Client Secret
            company_id: QuickBooks Company ID  
            client_name: Name of the client
        """
        # Step 1: Set up QuickBooks connection
        qb_container = await self.quickbooks_connector(client_id, client_secret, company_id)
        
        # Step 2: Fetch financial data
        financial_data = await self.fetch_financial_data(qb_container)
        
        # Step 3: Calculate KPIs
        kpi_data = await self.calculate_kpis(financial_data)
        
        # Step 4: Build dashboard data
        dashboard_data = await self.build_dashboard_data(kpi_data)
        
        # Return combined results
        return f"""
Analysis Complete for {client_name}
=====================================

Financial Data:
{financial_data}

KPIs:
{kpi_data}

Dashboard Data:
{dashboard_data}
"""