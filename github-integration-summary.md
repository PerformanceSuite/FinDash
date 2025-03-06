# GitHub Integration Summary

## Repository Information
- Repository URL: https://github.com/SplinteredSunlight/FinDash
- Repository Owner: SplinteredSunlight
- Repository Name: FinDash

## Completed Tasks
1. Initialized git repository
2. Added GitHub remote: https://github.com/SplinteredSunlight/FinDash.git
3. Committed all project files to the repository
4. Updated README with correct GitHub information
5. Added important URLs to the README

## Important URLs

### Legal Documents
- EULA: https://github.com/SplinteredSunlight/FinDash/blob/main/public/eula.html
- Privacy Policy: https://github.com/SplinteredSunlight/FinDash/blob/main/public/privacy.html

### QuickBooks Integration
- Host Domain: https://github.com/SplinteredSunlight/FinDash
- Launch URL: https://github.com/SplinteredSunlight/FinDash/blob/main/src/api/routes/quickbooks.ts#L14
- Callback URL: https://github.com/SplinteredSunlight/FinDash/blob/main/src/api/routes/quickbooks.ts#L21
- Disconnect URL: https://github.com/SplinteredSunlight/FinDash/blob/main/src/api/routes/quickbooks.ts#L35

## Alternative URLs for QuickBooks Integration
If the GitHub repository URLs are not accepted by the dev portal, you might try these alternatives:

### Option 1: Raw GitHub URLs
- Host Domain: https://raw.githubusercontent.com/SplinteredSunlight/FinDash/main/
- Launch URL: https://raw.githubusercontent.com/SplinteredSunlight/FinDash/main/src/api/routes/quickbooks.ts
- Callback URL: https://raw.githubusercontent.com/SplinteredSunlight/FinDash/main/src/api/routes/quickbooks.ts
- Disconnect URL: https://raw.githubusercontent.com/SplinteredSunlight/FinDash/main/src/api/routes/quickbooks.ts

### Option 2: GitHub Pages URLs (if enabled)
- Host Domain: https://splinteredsunlight.github.io/FinDash/
- Launch URL: https://splinteredsunlight.github.io/FinDash/api/v1/quickbooks/connect/:companyId
- Callback URL: https://splinteredsunlight.github.io/FinDash/api/v1/quickbooks/callback
- Disconnect URL: https://splinteredsunlight.github.io/FinDash/api/v1/quickbooks/disconnect/:companyId

### Option 3: Localhost URLs (for development)
- Host Domain: https://localhost:3000
- Launch URL: https://localhost:3000/api/v1/quickbooks/connect/:companyId
- Callback URL: https://localhost:3000/api/v1/quickbooks/callback
- Disconnect URL: https://localhost:3000/api/v1/quickbooks/disconnect/:companyId

## QuickBooks API Configuration
From the .env file:
```
QUICKBOOKS_CLIENT_ID=AB2XB3FGQNxqC7cCSxN7UYaIewOO2T6yaWxkLJWj9wNXDz0Zwd
QUICKBOOKS_CLIENT_SECRET=wHgBgE1yqKWLjndP3VBNgAggGXGqnrqYLEtwXtyv
QUICKBOOKS_REDIRECT_URI=https://localhost:3000/api/v1/quickbooks/callback
QUICKBOOKS_ENVIRONMENT=sandbox
QUICKBOOKS_SANDBOX_COMPANY_ID=9341454113533595
```

## Next Steps
1. If GitHub Pages is needed, enable it in the repository settings
2. Update the QuickBooks developer portal with the correct URLs
3. Test the QuickBooks integration
