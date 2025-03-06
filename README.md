# FinDash - AI-Powered Accounting Software

A modern accounting software solution with AI capabilities for automated financial analysis, bookkeeping, and reporting.

## Features

- Double-entry bookkeeping system
- Financial reporting (Income Statement, Balance Sheet, Cash Flow)
- Invoice generation and management
- Expense tracking and categorization
- Bank account integration
- Tax calculation and reporting
- AI-powered financial analysis
- QuickBooks Online integration
- Multi-user access with role-based permissions

## Project Structure

```
FinDash/
├── src/                  # Source code
│   ├── api/              # API endpoints
│   ├── models/           # Data models
│   ├── services/         # Business logic
│   ├── utils/            # Utility functions
│   ├── controllers/      # Request handlers
│   ├── middleware/       # Express middleware
│   ├── config/           # Configuration
│   └── client/           # Frontend code
│       ├── components/   # React components
│       ├── pages/        # Page components
│       ├── assets/       # Static assets
│       └── styles/       # CSS/SCSS files
├── tests/                # Test files
│   ├── unit/             # Unit tests
│   ├── integration/      # Integration tests
│   └── e2e/              # End-to-end tests
├── docs/                 # Documentation
├── scripts/              # Utility scripts
├── db/                   # Database
│   ├── migrations/       # Database migrations
│   └── seeds/            # Seed data
└── public/               # Static files
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL
- Git

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/SplinteredSunlight/FinDash.git
   cd FinDash
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   ```
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. Run database migrations:
   ```
   npm run migrate
   ```

5. Seed the database (optional):
   ```
   npm run seed
   ```

6. Start the development server:
   ```
   npm run dev
   ```

## Development

### Running Tests

```
npm test                # Run all tests
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Run tests with coverage report
```

### Linting

```
npm run lint            # Check for linting issues
npm run lint:fix        # Fix linting issues automatically
```

### Building for Production

```
npm run build
npm start
```

## API Documentation

API documentation is available at `/api/docs` when running the server.

## Important URLs

### Legal Documents
- EULA: https://github.com/SplinteredSunlight/FinDash/blob/main/public/eula.html
- Privacy Policy: https://github.com/SplinteredSunlight/FinDash/blob/main/public/privacy.html

### QuickBooks Integration
- Host Domain: https://github.com/SplinteredSunlight/FinDash
- Launch URL: https://github.com/SplinteredSunlight/FinDash/blob/main/src/api/routes/quickbooks.ts#L14
- Callback URL: https://github.com/SplinteredSunlight/FinDash/blob/main/src/api/routes/quickbooks.ts#L21
- Disconnect URL: https://github.com/SplinteredSunlight/FinDash/blob/main/src/api/routes/quickbooks.ts#L35

## License

This project is licensed under the MIT License - see the LICENSE file for details.
