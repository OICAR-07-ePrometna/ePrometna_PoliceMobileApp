import { login } from '@/services/authService';
import { safeInstance } from '@/services/axios';
import axios from 'axios';
import type { LoginDto } from '@/dtos/loginDto';
import type { ApiError } from '@/models/apiErrors';

// Mock the safeInstance
jest.mock('@/services/axios', () => ({
  safeInstance: {
    post: jest.fn(),
  },
}));

// Mock axios
jest.mock('axios', () => ({
  isAxiosError: jest.fn(),
}));

describe('login', () => {
  const mockSafeInstance = safeInstance as jest.Mocked<typeof safeInstance>;
  const mockAxios = axios as jest.Mocked<typeof axios>;

  const mockCredentials: LoginDto = {
    email: 'test@example.com',
    password: 'password123',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('successful login', () => {
    it('should login successfully', async () => {
      const mockResponseData = {
        accessToken: 'access-token-123',
        refreshToken: 'refresh-token-456',
        user: {
          uuid: 'user-uuid-789',
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
        },
      };

      const mockResponse = {
        data: mockResponseData,
        status: 200,
        statusText: 'OK',
      };

      mockSafeInstance.post.mockResolvedValueOnce(mockResponse);

      const result = await login(mockCredentials);

      expect(mockSafeInstance.post).toHaveBeenCalledWith('/auth/login', mockCredentials);
      expect(mockSafeInstance.post).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockResponseData);
    });
  });

  describe('Axios error handling', () => {
    it('should handle 401 Unauthorized error with API message', async () => {
      const mockApiError: ApiError = {
        message: 'Invalid email or password',
        statusCode: 401,
        timestamp: '2025-06-03T10:00:00Z',
      };

      const mockAxiosError = {
        response: {
          data: mockApiError,
          status: 401,
          statusText: 'Unauthorized',
        },
        config: {
          url: '/auth/login',
        },
        isAxiosError: true,
      };

      mockAxios.isAxiosError.mockReturnValue(true);
      mockSafeInstance.post.mockRejectedValueOnce(mockAxiosError);

      await expect(login(mockCredentials)).rejects.toThrow('Invalid email or password');
    });

    it('should handle 500 Internal Server Error with API message', async () => {
      const mockApiError: ApiError = {
        message: 'Internal server error occurred',
        statusCode: 500,
        timestamp: '2025-06-03T10:00:00Z',
      };

      const mockAxiosError = {
        response: {
          data: mockApiError,
          status: 500,
          statusText: 'Internal Server Error',
        },
        isAxiosError: true,
      };

      mockAxios.isAxiosError.mockReturnValue(true);
      mockSafeInstance.post.mockRejectedValueOnce(mockAxiosError);

      await expect(login(mockCredentials)).rejects.toThrow('Internal server error occurred');
    });

    it('should handle Axios error with null response data', async () => {
      const mockAxiosError = {
        response: {
          data: null,
          status: 404,
          statusText: 'Not Found',
        },
        isAxiosError: true,
      };

      mockAxios.isAxiosError.mockReturnValue(true);
      mockSafeInstance.post.mockRejectedValueOnce(mockAxiosError);

      await expect(login(mockCredentials)).rejects.toThrow('Login failed');
    });
  });
});