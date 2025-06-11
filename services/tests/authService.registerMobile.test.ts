import { registerMobile } from '@/services/authService';
import { safeInstance } from '@/services/axios';
import { getDeviceInfo } from '@/utilities/deviceUtils';
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

// Mock getDeviceInfo utility
jest.mock('@/utilities/deviceUtils', () => ({
  getDeviceInfo: jest.fn(),
}));


const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation();

describe('registerMobile', () => {
  const mockSafeInstance = safeInstance as jest.Mocked<typeof safeInstance>;
  const mockAxios = axios as jest.Mocked<typeof axios>;
  const mockGetDeviceInfo = getDeviceInfo as jest.MockedFunction<typeof getDeviceInfo>;

  const mockCredentials: LoginDto = {
    email: 'newuser@example.com',
    password: 'password123',
  };

  const mockDeviceInfo = {
    platform: 'ios',
    brand: 'Apple',
    modelName: 'iPhone 14',
    deviceName: 'User iPhone',
    osName: 'iOS',
    osVersion: '17.1.0',
    deviceId: 'device-uuid-123',
    appVersion: '1.2.3',
    buildVersion: '456',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetDeviceInfo.mockResolvedValue(mockDeviceInfo);
  });

  afterAll(() => {
    mockConsoleLog.mockRestore();
    mockConsoleError.mockRestore();
  });

  describe('successful mobile registration', () => {
    it('should register mobile user successfully', async () => {
      const mockResponse = {
        data: {
          accessToken: 'mobile-access-token-123',
          refreshToken: 'mobile-refresh-token-456',
          deviceToken: 'mobile-device-token-789',
        },
        status: 201,
        statusText: 'Created',
      };

      mockSafeInstance.post.mockResolvedValueOnce(mockResponse);

      const result = await registerMobile(mockCredentials);

      const expectedPayload = {
        email: 'newuser@example.com',
        password: 'password123',
        deviceInfo: {
          platform: 'ios',
          brand: 'Apple',
          modelName: 'iPhone 14',
          deviceId: 'device-uuid-123',
          osName: 'iOS',
          osVersion: '17.1.0',
          appVersion: '1.2.3',
          buildVersion: '456',
        },
      };

      expect(mockGetDeviceInfo).toHaveBeenCalledTimes(1);
      expect(mockSafeInstance.post).toHaveBeenCalledWith('/auth/user/register', expectedPayload);
      expect(mockSafeInstance.post).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        accessToken: 'mobile-access-token-123',
        refreshToken: 'mobile-refresh-token-456',
        deviceToken: 'mobile-device-token-789',
      });
      expect(mockConsoleLog).toHaveBeenCalledWith('Mobile registration tokens received:', {
        accessToken: 'Yes',
        refreshToken: 'Yes',
        deviceToken: 'Yes',
      });
    });
  });
  
  describe('Axios error handling', () => {
    it('should handle 500 Internal Server Error', async () => {
      const mockApiError: ApiError = {
        message: 'Database connection failed',
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

      await expect(registerMobile(mockCredentials)).rejects.toThrow('Database connection failed');

      expect(mockConsoleError).toHaveBeenCalledWith('Mobile registration error response:', mockApiError);
    });
  });
});