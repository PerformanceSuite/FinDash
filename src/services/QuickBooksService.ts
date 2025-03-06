import axios from 'axios';
import querystring from 'querystring';
import { v4 as uuidv4 } from 'uuid';
import { QuickBooksTokenModel, QuickBooksToken } from '../models/QuickBooksToken';
import db from '../config/database';

export interface QuickBooksConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  environment: 'sandbox' | 'production';
}

export class QuickBooksService {
  private tokenModel: QuickBooksTokenModel;
  private config: QuickBooksConfig;
  private authBaseUrl: string;
  private apiBaseUrl: string;

  constructor() {
    this.tokenModel = new QuickBooksTokenModel(db);
    this.config = {
      clientId: process.env.QUICKBOOKS_CLIENT_ID || '',
      clientSecret: process.env.QUICKBOOKS_CLIENT_SECRET || '',
      redirectUri: process.env.QUICKBOOKS_REDIRECT_URI || '',
      environment: (process.env.NODE_ENV === 'production') ? 'production' : 'sandbox',
    };

    // Set base URLs based on environment
    if (this.config.environment === 'sandbox') {
      this.authBaseUrl = 'https://oauth.platform.intuit.com/oauth2/v1';
      this.apiBaseUrl = 'https://sandbox-quickbooks.api.intuit.com/v3';
    } else {
      this.authBaseUrl = 'https://oauth.platform.intuit.com/oauth2/v1';
      this.apiBaseUrl = 'https://quickbooks.api.intuit.com/v3';
    }
  }

  /**
   * Generate authorization URL for QuickBooks OAuth flow
   */
  getAuthorizationUrl(companyId: string, userId: string): string {
    const state = uuidv4();
    const scopes = [
      'com.intuit.quickbooks.accounting',
      'com.intuit.quickbooks.payment',
    ].join(' ');

    const params = {
      client_id: this.config.clientId,
      response_type: 'code',
      scope: scopes,
      redirect_uri: this.config.redirectUri,
      state: `${state}|${companyId}|${userId}`,
    };

    return `${this.authBaseUrl}/authorize?${querystring.stringify(params)}`;
  }

  /**
   * Exchange authorization code for access and refresh tokens
   */
  async exchangeCodeForTokens(code: string): Promise<{
    access_token: string;
    refresh_token: string;
    expires_in: number;
    x_refresh_token_expires_in: number;
    realmId: string;
  }> {
    const params = {
      grant_type: 'authorization_code',
      code,
      redirect_uri: this.config.redirectUri,
    };

    const auth = Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`).toString('base64');

    try {
      const response = await axios.post(
        `${this.authBaseUrl}/token`,
        querystring.stringify(params),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${auth}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error exchanging code for tokens:', error);
      throw new Error('Failed to exchange authorization code for tokens');
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(refreshToken: string): Promise<{
    access_token: string;
    refresh_token: string;
    expires_in: number;
    x_refresh_token_expires_in: number;
  }> {
    const params = {
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    };

    const auth = Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`).toString('base64');

    try {
      const response = await axios.post(
        `${this.authBaseUrl}/token`,
        querystring.stringify(params),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${auth}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error refreshing access token:', error);
      throw new Error('Failed to refresh access token');
    }
  }

  /**
   * Save QuickBooks tokens to database
   */
  async saveTokens(
    companyId: string,
    userId: string,
    realmId: string,
    accessToken: string,
    refreshToken: string,
    accessTokenExpiresAt: Date,
    refreshTokenExpiresAt: Date
  ): Promise<QuickBooksToken> {
    // Check if tokens already exist for this company
    const existingToken = await this.tokenModel.findByCompanyId(companyId);

    if (existingToken) {
      // Update existing tokens
      return this.tokenModel.update(existingToken.id, {
        realm_id: realmId,
        access_token: accessToken,
        refresh_token: refreshToken,
        access_token_expires_at: accessTokenExpiresAt,
        refresh_token_expires_at: refreshTokenExpiresAt,
        updated_by: userId,
      });
    } else {
      // Create new tokens
      return this.tokenModel.create({
        company_id: companyId,
        realm_id: realmId,
        access_token: accessToken,
        refresh_token: refreshToken,
        access_token_expires_at: accessTokenExpiresAt,
        refresh_token_expires_at: refreshTokenExpiresAt,
        created_by: userId,
        updated_by: userId,
      });
    }
  }

  /**
   * Get valid access token for a company
   * Refreshes token if expired
   */
  async getValidAccessToken(companyId: string): Promise<string> {
    const token = await this.tokenModel.findByCompanyId(companyId);
    
    if (!token) {
      throw new Error('No QuickBooks connection found for this company');
    }

    // Check if access token is expired or about to expire (within 5 minutes)
    const now = new Date();
    const expiryBuffer = 5 * 60 * 1000; // 5 minutes in milliseconds
    
    if (token.access_token_expires_at.getTime() - now.getTime() < expiryBuffer) {
      // Token is expired or about to expire, refresh it
      const refreshResult = await this.refreshAccessToken(token.refresh_token);
      
      // Calculate new expiry dates
      const accessTokenExpiresAt = new Date(now.getTime() + refreshResult.expires_in * 1000);
      const refreshTokenExpiresAt = new Date(now.getTime() + refreshResult.x_refresh_token_expires_in * 1000);
      
      // Update tokens in database
      const updatedToken = await this.tokenModel.update(token.id, {
        access_token: refreshResult.access_token,
        refresh_token: refreshResult.refresh_token,
        access_token_expires_at: accessTokenExpiresAt,
        refresh_token_expires_at: refreshTokenExpiresAt,
      });
      
      return updatedToken.access_token;
    }
    
    // Token is still valid
    return token.access_token;
  }

  /**
   * Make a request to the QuickBooks API
   */
  async makeApiRequest(
    companyId: string,
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    data?: any
  ): Promise<any> {
    try {
      // Get valid access token
      const accessToken = await this.getValidAccessToken(companyId);
      
      // Get realm ID
      const token = await this.tokenModel.findByCompanyId(companyId);
      if (!token) {
        throw new Error('No QuickBooks connection found for this company');
      }
      
      // Make API request
      const response = await axios({
        method,
        url: `${this.apiBaseUrl}/company/${token.realm_id}/${endpoint}`,
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        data,
      });
      
      return response.data;
    } catch (error) {
      console.error('Error making QuickBooks API request:', error);
      throw new Error('Failed to make QuickBooks API request');
    }
  }

  /**
   * Check if a company has a valid QuickBooks connection
   */
  async hasValidConnection(companyId: string): Promise<boolean> {
    try {
      const token = await this.tokenModel.findByCompanyId(companyId);
      
      if (!token) {
        return false;
      }
      
      // Check if refresh token is expired
      const now = new Date();
      if (token.refresh_token_expires_at.getTime() <= now.getTime()) {
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error checking QuickBooks connection:', error);
      return false;
    }
  }

  /**
   * Disconnect QuickBooks for a company
   */
  async disconnect(companyId: string): Promise<boolean> {
    try {
      const token = await this.tokenModel.findByCompanyId(companyId);
      
      if (!token) {
        return false;
      }
      
      // Delete token from database
      await this.tokenModel.delete(token.id);
      
      return true;
    } catch (error) {
      console.error('Error disconnecting QuickBooks:', error);
      return false;
    }
  }

  /**
   * Get company info from QuickBooks
   */
  async getCompanyInfo(companyId: string): Promise<any> {
    return this.makeApiRequest(companyId, 'companyinfo/' + await this.getRealmId(companyId));
  }

  /**
   * Get realm ID for a company
   */
  private async getRealmId(companyId: string): Promise<string> {
    const token = await this.tokenModel.findByCompanyId(companyId);
    
    if (!token) {
      throw new Error('No QuickBooks connection found for this company');
    }
    
    return token.realm_id;
  }
}

export default new QuickBooksService();
