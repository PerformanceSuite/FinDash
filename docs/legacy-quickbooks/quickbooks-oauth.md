# QuickBooks OAuth Integration

This document describes the QuickBooks OAuth integration for the accounting software.

## Overview

The QuickBooks OAuth integration allows users to connect their QuickBooks Online accounts to the accounting software. This enables the software to access and sync data from QuickBooks, such as accounts, transactions, customers, vendors, invoices, and bills.

## OAuth Flow

The QuickBooks OAuth flow follows the standard OAuth 2.0 authorization code flow:

1. User initiates the connection by clicking a "Connect to QuickBooks" button
2. User is redirected to the QuickBooks authorization page
3. User logs in to QuickBooks and authorizes the application
4. QuickBooks redirects back to the application with an authorization code
5. The application exchanges the authorization code for access and refresh tokens
6. The application stores the tokens securely and uses them to make API requests

## API Endpoints

### Initiate OAuth Flow

```
GET /api/v1/quickbooks/connect/:companyId
```

This endpoint initiates the QuickBooks OAuth flow by redirecting the user to the QuickBooks authorization page.

**Parameters:**
- `companyId`: The ID of the company to connect to QuickBooks

**Authentication:**
- Requires a valid JWT token

**Response:**
- Redirects to the QuickBooks authorization page

### OAuth Callback

```
GET /api/v1/quickbooks/callback
```

This endpoint handles the callback from QuickBooks after the user authorizes the application.

**Query Parameters:**
- `code`: The authorization code from QuickBooks
- `state`: The state parameter passed to QuickBooks (format: `uuid|companyId|userId`)
- `realmId`: The QuickBooks company ID

**Authentication:**
- No authentication required (public endpoint)

**Response:**
- Redirects to the success page

### Success Page

```
GET /api/v1/quickbooks/success
```

This endpoint displays a success message after the QuickBooks connection is established.

**Query Parameters:**
- `companyId`: The ID of the company that was connected to QuickBooks

**Authentication:**
- No authentication required (public endpoint)

**Response:**
```json
{
  "success": true,
  "message": "QuickBooks connected successfully",
  "companyId": "company-id"
}
```

### Check Connection Status

```
GET /api/v1/quickbooks/status/:companyId
```

This endpoint checks if a company is connected to QuickBooks.

**Parameters:**
- `companyId`: The ID of the company to check

**Authentication:**
- Requires a valid JWT token

**Response:**
```json
{
  "connected": true,
  "companyId": "company-id"
}
```

### Disconnect QuickBooks

```
DELETE /api/v1/quickbooks/disconnect/:companyId
```

This endpoint disconnects a company from QuickBooks.

**Parameters:**
- `companyId`: The ID of the company to disconnect

**Authentication:**
- Requires a valid JWT token

**Response:**
```json
{
  "success": true,
  "message": "QuickBooks disconnected successfully",
  "companyId": "company-id"
}
```

### Get Company Info

```
GET /api/v1/quickbooks/company-info/:companyId
```

This endpoint retrieves company information from QuickBooks.

**Parameters:**
- `companyId`: The ID of the company to get information for

**Authentication:**
- Requires a valid JWT token

**Response:**
- Returns the company information from QuickBooks

## Token Management

The application manages QuickBooks tokens as follows:

1. Access tokens are valid for 1 hour
2. Refresh tokens are valid for 100 days
3. The application automatically refreshes access tokens when they expire
4. If a refresh token expires, the user must reconnect to QuickBooks

## Security Considerations

- Access and refresh tokens are stored securely in the database
- Tokens are encrypted at rest
- API requests use HTTPS
- The application validates the state parameter to prevent CSRF attacks
- The application uses proper error handling to avoid leaking sensitive information

## Error Handling

The application handles various error scenarios:

- Invalid or missing parameters
- Authorization errors
- Token refresh failures
- API request failures

In all cases, the application returns appropriate error messages and status codes.

## Testing

To test the QuickBooks integration:

1. Create a QuickBooks developer account
2. Create a QuickBooks app in the developer portal
3. Configure the app with the correct redirect URI
4. Set the client ID and secret in the application's environment variables
5. Connect to QuickBooks using the application's UI
6. Verify that the connection is successful
7. Test API requests to retrieve data from QuickBooks
