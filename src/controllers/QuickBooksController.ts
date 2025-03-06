import { Request, Response } from 'express';
import quickBooksService from '../services/QuickBooksService';
import authService from '../services/AuthService';

export class QuickBooksController {
  /**
   * Initiate QuickBooks OAuth flow
   */
  async connect(req: Request, res: Response): Promise<void> {
    try {
      // Log request details for debugging
      console.log('QuickBooks connect request:', {
        headers: req.headers,
        params: req.params,
        query: req.query,
        user: req.user ? 'User exists' : 'No user on request',
      });

      // Check for token in query parameters (from form submission)
      const tokenFromQuery = req.query.token as string;
      if (tokenFromQuery) {
        console.log('Token found in query parameters, validating...');
        const user = await authService.getUserFromToken(tokenFromQuery);
        if (user) {
          console.log('Token is valid, user found:', user.email);
          req.user = user;
        } else {
          console.error('Invalid token from query parameters');
        }
      }

      // Validate request
      if (!req.user) {
        console.error('Authentication required - no user object on request');
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const { companyId } = req.params;
      if (!companyId) {
        console.error('Company ID is required');
        res.status(400).json({ error: 'Company ID is required' });
        return;
      }

      // Generate authorization URL
      const authUrl = quickBooksService.getAuthorizationUrl(companyId, req.user.id);
      console.log('Generated QuickBooks authorization URL:', authUrl);
      
      // Redirect to QuickBooks authorization page
      res.redirect(authUrl);
    } catch (error) {
      console.error('QuickBooks connect error:', error);
      res.status(500).json({ error: 'Failed to initiate QuickBooks connection' });
    }
  }

  /**
   * Handle OAuth callback from QuickBooks
   */
  async callback(req: Request, res: Response): Promise<void> {
    try {
      // Validate request
      const { code, state, realmId } = req.query;
      
      if (!code || !state || !realmId) {
        res.status(400).json({ error: 'Invalid callback parameters' });
        return;
      }

      // Parse state parameter (format: uuid|companyId|userId)
      const stateParts = (state as string).split('|');
      if (stateParts.length !== 3) {
        res.status(400).json({ error: 'Invalid state parameter' });
        return;
      }

      const [_, companyId, userId] = stateParts;

      // Exchange authorization code for tokens
      const tokenResponse = await quickBooksService.exchangeCodeForTokens(code as string);
      
      // Calculate token expiry dates
      const now = new Date();
      const accessTokenExpiresAt = new Date(now.getTime() + tokenResponse.expires_in * 1000);
      const refreshTokenExpiresAt = new Date(now.getTime() + tokenResponse.x_refresh_token_expires_in * 1000);
      
      // Save tokens to database
      await quickBooksService.saveTokens(
        companyId,
        userId,
        realmId as string,
        tokenResponse.access_token,
        tokenResponse.refresh_token,
        accessTokenExpiresAt,
        refreshTokenExpiresAt
      );
      
      // Redirect to success page
      res.redirect(`/api/v1/quickbooks/success?companyId=${companyId}`);
    } catch (error) {
      console.error('QuickBooks callback error:', error);
      res.status(500).json({ error: 'Failed to complete QuickBooks connection' });
    }
  }

  /**
   * Success page after successful connection
   */
  async success(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.query;
      
      if (!companyId) {
        res.status(400).json({ error: 'Company ID is required' });
        return;
      }
      
      // Check if connection is valid
      const isConnected = await quickBooksService.hasValidConnection(companyId as string);
      
      if (!isConnected) {
        res.status(400).json({ error: 'QuickBooks connection failed' });
        return;
      }
      
      // Return success response
      res.status(200).json({
        success: true,
        message: 'QuickBooks connected successfully',
        companyId,
      });
    } catch (error) {
      console.error('QuickBooks success error:', error);
      res.status(500).json({ error: 'Failed to verify QuickBooks connection' });
    }
  }

  /**
   * Disconnect QuickBooks
   */
  async disconnect(req: Request, res: Response): Promise<void> {
    try {
      // Validate request
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const { companyId } = req.params;
      if (!companyId) {
        res.status(400).json({ error: 'Company ID is required' });
        return;
      }
      
      // Disconnect QuickBooks
      const success = await quickBooksService.disconnect(companyId);
      
      if (!success) {
        res.status(400).json({ error: 'Failed to disconnect QuickBooks' });
        return;
      }
      
      // Return success response
      res.status(200).json({
        success: true,
        message: 'QuickBooks disconnected successfully',
        companyId,
      });
    } catch (error) {
      console.error('QuickBooks disconnect error:', error);
      res.status(500).json({ error: 'Failed to disconnect QuickBooks' });
    }
  }

  /**
   * Check connection status
   */
  async status(req: Request, res: Response): Promise<void> {
    try {
      // Validate request
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const { companyId } = req.params;
      if (!companyId) {
        res.status(400).json({ error: 'Company ID is required' });
        return;
      }
      
      // Check if connection is valid
      const isConnected = await quickBooksService.hasValidConnection(companyId);
      
      // Return status
      res.status(200).json({
        connected: isConnected,
        companyId,
      });
    } catch (error) {
      console.error('QuickBooks status error:', error);
      res.status(500).json({ error: 'Failed to check QuickBooks connection status' });
    }
  }

  /**
   * Get company info from QuickBooks
   */
  async companyInfo(req: Request, res: Response): Promise<void> {
    try {
      // Validate request
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const { companyId } = req.params;
      if (!companyId) {
        res.status(400).json({ error: 'Company ID is required' });
        return;
      }
      
      // Check if connection is valid
      const isConnected = await quickBooksService.hasValidConnection(companyId);
      
      if (!isConnected) {
        res.status(400).json({ error: 'QuickBooks is not connected' });
        return;
      }
      
      // Get company info
      const companyInfo = await quickBooksService.getCompanyInfo(companyId);
      
      // Return company info
      res.status(200).json(companyInfo);
    } catch (error) {
      console.error('QuickBooks company info error:', error);
      res.status(500).json({ error: 'Failed to get QuickBooks company info' });
    }
  }
}

export default new QuickBooksController();
