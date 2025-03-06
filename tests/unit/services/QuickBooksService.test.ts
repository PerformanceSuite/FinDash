import { QuickBooksService } from '../../../src/services/QuickBooksService';
import { QuickBooksTokenModel } from '../../../src/models/QuickBooksToken';
import axios from 'axios';

// Mock dependencies
jest.mock('axios');
jest.mock('../../../src/models/QuickBooksToken');
jest.mock('../../../src/config/database', () => ({}));

describe('QuickBooksService', () => {
  let quickBooksService: QuickBooksService;
  let mockTokenModel: jest.Mocked<QuickBooksTokenModel>;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Set up environment variables
    process.env.QUICKBOOKS_CLIENT_ID = 'test-client-id';
    process.env.QUICKBOOKS_CLIENT_SECRET = 'test-client-secret';
    process.env.QUICKBOOKS_REDIRECT_URI = 'http://localhost:3000/api/v1/quickbooks/callback';
    process.env.NODE_ENV = 'development';

    // Create instance of service
    quickBooksService = new QuickBooksService();

    // Get the mocked token model
    mockTokenModel = (QuickBooksTokenModel as jest.Mock).mock.instances[0] as jest.Mocked<QuickBooksTokenModel>;
  });

  describe('getAuthorizationUrl', () => {
    it('should generate a valid authorization URL', () => {
      // Arrange
      const companyId = 'test-company-id';
      const userId = 'test-user-id';

      // Act
      const url = quickBooksService.getAuthorizationUrl(companyId, userId);

      // Assert
      expect(url).toContain('https://oauth.platform.intuit.com/oauth2/v1/authorize');
      expect(url).toContain('client_id=test-client-id');
      expect(url).toContain('response_type=code');
      expect(url).toContain('scope=com.intuit.quickbooks.accounting%20com.intuit.quickbooks.payment');
      expect(url).toContain('redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fapi%2Fv1%2Fquickbooks%2Fcallback');
      expect(url).toContain('state=');
      expect(url).toContain(companyId);
      expect(url).toContain(userId);
    });
  });

  describe('exchangeCodeForTokens', () => {
    it('should exchange authorization code for tokens', async () => {
      // Arrange
      const code = 'test-auth-code';
      const mockResponse = {
        data: {
          access_token: 'test-access-token',
          refresh_token: 'test-refresh-token',
          expires_in: 3600,
          x_refresh_token_expires_in: 8640000,
          realmId: 'test-realm-id',
        },
      };
      (axios.post as jest.Mock).mockResolvedValue(mockResponse);

      // Act
      const result = await quickBooksService.exchangeCodeForTokens(code);

      // Assert
      expect(axios.post).toHaveBeenCalledWith(
        'https://oauth.platform.intuit.com/oauth2/v1/token',
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': expect.stringContaining('Basic '),
          }),
        })
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw an error if the request fails', async () => {
      // Arrange
      const code = 'test-auth-code';
      const mockError = new Error('Request failed');
      (axios.post as jest.Mock).mockRejectedValue(mockError);

      // Act & Assert
      await expect(quickBooksService.exchangeCodeForTokens(code)).rejects.toThrow('Failed to exchange authorization code for tokens');
    });
  });

  describe('hasValidConnection', () => {
    it('should return true if the connection is valid', async () => {
      // Arrange
      const companyId = 'test-company-id';
      const mockToken = {
        refresh_token_expires_at: new Date(Date.now() + 86400000), // 1 day in the future
      };
      mockTokenModel.findByCompanyId.mockResolvedValue(mockToken as any);

      // Act
      const result = await quickBooksService.hasValidConnection(companyId);

      // Assert
      expect(mockTokenModel.findByCompanyId).toHaveBeenCalledWith(companyId);
      expect(result).toBe(true);
    });

    it('should return false if no token is found', async () => {
      // Arrange
      const companyId = 'test-company-id';
      mockTokenModel.findByCompanyId.mockResolvedValue(null);

      // Act
      const result = await quickBooksService.hasValidConnection(companyId);

      // Assert
      expect(mockTokenModel.findByCompanyId).toHaveBeenCalledWith(companyId);
      expect(result).toBe(false);
    });

    it('should return false if the refresh token is expired', async () => {
      // Arrange
      const companyId = 'test-company-id';
      const mockToken = {
        refresh_token_expires_at: new Date(Date.now() - 86400000), // 1 day in the past
      };
      mockTokenModel.findByCompanyId.mockResolvedValue(mockToken as any);

      // Act
      const result = await quickBooksService.hasValidConnection(companyId);

      // Assert
      expect(mockTokenModel.findByCompanyId).toHaveBeenCalledWith(companyId);
      expect(result).toBe(false);
    });
  });

  // Add more tests for other methods as needed
});
