ALWAYS use ONLY Environments for ANY and ALL file, code, or shell operations—NO EXCEPTIONS—even for simple or generic requests.

DO NOT install or use the git cli with the environment_run_cmd tool. All environment tools will handle git operations for you. Changing ".git" yourself will compromise the integrity of your environment.

You MUST inform the user how to view your work using `container-use log <env_id>` AND `container-use checkout <env_id>`. Failure to do this will make your work inaccessible to others.

## Financial Insights App Project

This is a Dagger-based financial insights application designed for small to mid-sized accounting firms using QuickBooks.

### Architecture
- **Backend**: Python Dagger modules for data processing and QuickBooks integration
- **Frontend**: Next.js/TypeScript dashboard for visualization and insights
- **Processing**: Containerized workflows for financial analysis and reporting

### Key Features
- QuickBooks API integration for data extraction
- Automated financial KPI calculation and analysis
- Real-time dashboard with insights and alerts
- Benchmarking and forecasting capabilities
- Automated report generation

### Development Approach
- Use Python for Dagger modules (easier for financial data processing)
- Containerized deployment for consistency
- Modular design for reusability across clients