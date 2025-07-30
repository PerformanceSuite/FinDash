# FinDash - Financial Insights Dashboard

A Dagger-based financial insights application designed for small to mid-sized accounting firms using QuickBooks.

> **Migration Note**: This project has been migrated from a Node.js/TypeScript architecture to a Python/Dagger-based solution for better containerization and workflow automation. The legacy Node.js version is preserved in the `legacy-nodejs-version` branch.

## Architecture Overview

This application uses **Python** for Dagger modules (financial data processing) and **Next.js/TypeScript** for the frontend dashboard.

### Core Components

1. **QuickBooks Integration** - Secure data extraction from QB API
2. **Financial Analysis Engine** - KPI calculation and insights generation  
3. **Dashboard Interface** - Real-time visualization and reporting
4. **Automated Workflows** - Containerized processing pipelines

## Key Features

- 📊 **Real-time Financial Dashboards** - Interactive KPI visualization
- 🔗 **QuickBooks API Integration** - Secure data synchronization
- 📈 **Automated KPI Calculation** - 30+ financial metrics
- 🚨 **Smart Alerts** - Cash flow and performance notifications
- 📋 **Automated Reporting** - Client-ready financial reports
- 🔄 **Containerized Workflows** - Consistent, scalable processing

## Getting Started

### Prerequisites
- Python 3.11+
- Dagger CLI
- QuickBooks Developer Account

### Installation

1. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

2. **Initialize Dagger**
   ```bash
   dagger develop
   ```

3. **Configure QuickBooks API**
   - Create QuickBooks app at https://developer.intuit.com
   - Get Client ID and Secret
   - Set up sandbox company for testing

### Usage

Run a complete financial analysis:

```bash
dagger call run-full-analysis \
  --client-id="your_qb_client_id" \
  --client-secret=env:QB_CLIENT_SECRET \
  --company-id="your_qb_company_id" \
  --client-name="Your Client Name"
```

### Available Dagger Functions

- `quickbooks_connector()` - Set up QB API container
- `fetch_financial_data()` - Extract data from QuickBooks  
- `calculate_kpis()` - Compute financial metrics
- `generate_insights_report()` - Create client reports
- `build_dashboard_data()` - Prepare data for frontend
- `run_full_analysis()` - Complete pipeline execution

## Project Structure

```
financial-insights-app-python/
├── main.py              # Main Dagger module
├── dagger.json          # Dagger configuration  
├── requirements.txt     # Python dependencies
├── backend/            # API and data processing
├── frontend/           # Next.js dashboard
├── shared/             # Shared utilities
└── docs/              # Documentation
```

## Development

This project follows the MCP (Model Context Protocol) pattern for consistent development:

- Use `container-use log <env_id>` to view work logs
- Use `container-use checkout <env_id>` to access environments
- All operations run in containerized environments for consistency

## Next Steps

1. Set up the Next.js frontend dashboard
2. Implement real QuickBooks OAuth flow
3. Add more sophisticated financial analytics
4. Create client-specific customizations
5. Deploy to production environment

## Contributing

This project uses Dagger for consistent, containerized development workflows. All changes should be tested through Dagger modules before deployment.