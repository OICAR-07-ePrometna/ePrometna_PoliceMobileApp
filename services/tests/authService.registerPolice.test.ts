import { registerPolice } from '@/services/authService';
import { safeInstance } from '@/services/axios';
import { getDeviceInfo } from '@/utilities/deviceUtils';
import axios from 'axios';
import type { PoliceRegisterDto } from '@/dtos/policeRegisterDto';
import type { ApiError } from '@/models/apiErrors';

// Mock the safeInstance
jest.mock('@/services/axios', () => ({
  safeInstance: {
    post: jest.fn(),
  },
}));

// MOCK AXIOS
jest.mock('axios', () => ({
  isAxiosError: jest.fn(),
}));

// MOCK DEVICE UTILS
jest.mock('@/utilities/deviceUtils', () => ({
  getDeviceInfo: jest.fn(),
}));

const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation();

describe('registerPolice', () => {
  const mockSafeInstance = safeInstance as jest.Mocked<typeof safeInstance>;
  const mockAxios = axios as jest.Mocked<typeof axios>;
  const mockGetDeviceInfo = getDeviceInfo as jest.MockedFunction<typeof getDeviceInfo>;

  const mockToken = 'POLICE123456';

  const mockDeviceInfo = {
    platform: 'ios',
    brand: 'Apple',
    modelName: 'iPhone 14 Pro',
    deviceName: 'Officer iPhone',
    osName: 'iOS',
    osVersion: '17.1.0',
    deviceId: 'police-device-uuid-123',
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

  describe('successful police registration', () => {
    it('should register police officer successfully', async () => {
      const mockResponse = {
        data: {
          accessToken: 'police-access-token-123',
          refreshToken: 'police-refresh-token-456',
          deviceToken: 'police-device-token-789',
        },
        status: 201,
        statusText: 'Created',
      };

      mockSafeInstance.post.mockResolvedValueOnce(mockResponse);

      const result = await registerPolice(mockToken);

      const expectedPayload: PoliceRegisterDto = {
        Code: 'POLICE123456',
        DeviceInfo: {
          Platform: 'ios',
          Brand: 'Apple',
          ModelName: 'iPhone 14 Pro',
          DeviceID: 'police-device-uuid-123',
        },
      };

      expect(mockGetDeviceInfo).toHaveBeenCalledTimes(1);
      expect(mockSafeInstance.post).toHaveBeenCalledWith('/auth/police/register', expectedPayload);
      expect(mockSafeInstance.post).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        accessToken: 'police-access-token-123',
        refreshToken: 'police-refresh-token-456',
        deviceToken: 'police-device-token-789',
      });
      expect(mockConsoleLog).toHaveBeenCalledWith('Police registration tokens received:', {
        accessToken: 'Yes',
        refreshToken: 'Yes',
        deviceToken: 'Yes',
      });
    });
  });

  describe('device info integration', () => {
    it('should call getDeviceInfo and use the returned data', async () => {
      const customDeviceInfo = {
        platform: 'web',
        brand: 'Unknown',
        modelName: 'Police Browser',
        deviceName: 'Police Web Terminal',
        osName: 'Windows',
        osVersion: '11',
        deviceId: 'police-web-device-id',
        appVersion: '2.0.0',
        buildVersion: '999',
      };

      mockGetDeviceInfo.mockResolvedValueOnce(customDeviceInfo);

      const mockResponse = {
        data: {
          accessToken: 'token',
          refreshToken: 'refresh',
          deviceToken: 'device',
        },
        status: 201,
      };

      mockSafeInstance.post.mockResolvedValueOnce(mockResponse);

      await registerPolice(mockToken);

      expect(mockGetDeviceInfo).toHaveBeenCalledTimes(1);
      expect(mockSafeInstance.post).toHaveBeenCalledWith('/auth/police/register', {
        Code: 'POLICE123456',
        DeviceInfo: {
          Platform: 'web',
          Brand: 'Unknown',
          ModelName: 'Police Browser',
          DeviceID: 'police-web-device-id',
        },
      });
    });

    it('should handle getDeviceInfo throwing an error', async () => {
      const deviceError = new Error('Failed to get police device info');
      mockGetDeviceInfo.mockRejectedValueOnce(deviceError);

      await expect(registerPolice(mockToken)).rejects.toThrow('An unexpected error occurred during police registration');

      expect(mockConsoleError).toHaveBeenCalledWith('Unexpected police registration error:', deviceError);
      expect(mockSafeInstance.post).not.toHaveBeenCalled();
    });
  });

  describe('Axios error handling', () => {
    it('should handle 401 Unauthorized error (invalid code)', async () => {
      const mockApiError: ApiError = {
        message: 'Invalid police registration code',
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
          url: '/auth/police/register',
        },
        isAxiosError: true,
      };

      mockAxios.isAxiosError.mockReturnValue(true);
      mockSafeInstance.post.mockRejectedValueOnce(mockAxiosError);

      await expect(registerPolice(mockToken)).rejects.toThrow('Invalid police registration code');

      expect(mockConsoleError).toHaveBeenCalledWith('Police registration error response:', mockApiError);
    });

    it('should handle 500 Internal Server Error', async () => {
      const mockApiError: ApiError = {
        message: 'Police registration system temporarily unavailable',
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

      await expect(registerPolice(mockToken)).rejects.toThrow('Police registration system temporarily unavailable');

      expect(mockConsoleError).toHaveBeenCalledWith('Police registration error response:', mockApiError);
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

      await expect(registerPolice(mockToken)).rejects.toThrow('Police registration failed');

      expect(mockConsoleError).toHaveBeenCalledWith('Police registration error response:', null);
    });
  });
});