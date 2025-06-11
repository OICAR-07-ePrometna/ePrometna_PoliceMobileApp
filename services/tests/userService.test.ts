import { getLoggedInUser } from '@/services/userService';
import apiClient from '@/services/axios';
import type { User } from '@/models/user';
import { UserRole } from '@/enums/userRole';

// Mock api
jest.mock('@/services/axios', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
  },
}));

const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation();

describe('getLoggedInUser', () => {
  const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

  const mockUser: User = {
    uuid: 'user-uuid-456',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    oib: '12345678901',
    residence: 'Zagreb, Croatia',
    birthDate: '1985-05-15',
    role: UserRole.Osoba,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    mockConsoleLog.mockRestore();
    mockConsoleError.mockRestore();
  });

  describe('successful user data retrieval', () => {
    it('should fetch logged in user data successfully', async () => {
      const mockResponse = {
        data: mockUser,
        status: 200,
        statusText: 'OK',
      };

      mockApiClient.get.mockResolvedValueOnce(mockResponse);

      const result = await getLoggedInUser();

      expect(mockApiClient.get).toHaveBeenCalledWith('/user/my-data');
      expect(mockApiClient.get).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockUser);
      expect(mockConsoleLog).toHaveBeenCalledWith('Logged in user data:', mockUser);
    });

    it('should return null when user data is null', async () => {
      const mockResponse = {
        data: null,
        status: 200,
      };

      mockApiClient.get.mockResolvedValueOnce(mockResponse);

      const result = await getLoggedInUser();

      expect(result).toBeNull();
      expect(mockConsoleLog).toHaveBeenCalledWith('Logged in user data:', null);
    });
  });

  describe('error handling', () => {
    it('should handle 401 Unauthorized errors', async () => {
      const mockError = {
        message: 'Request failed with status code 401',
        response: {
          status: 401,
          statusText: 'Unauthorized',
          data: { message: 'Token expired' },
        },
        config: {
          url: '/user/my-data',
        },
      };

      mockApiClient.get.mockRejectedValueOnce(mockError);

      await expect(getLoggedInUser()).rejects.toBe(mockError);

      expect(mockConsoleError).toHaveBeenCalledWith('Error fetching current user:', mockError);
    });

    it('should handle 403 Forbidden errors', async () => {
      const mockError = {
        message: 'Request failed with status code 403',
        response: {
          status: 403,
          statusText: 'Forbidden',
          data: { message: 'Access denied' },
        },
      };

      mockApiClient.get.mockRejectedValueOnce(mockError);

      await expect(getLoggedInUser()).rejects.toBe(mockError);

      expect(mockConsoleError).toHaveBeenCalledWith('Error fetching current user:', mockError);
    });

    it('should handle 404 Not Found errors', async () => {
      const mockError = {
        message: 'Request failed with status code 404',
        response: {
          status: 404,
          statusText: 'Not Found',
          data: { message: 'User not found' },
        },
      };

      mockApiClient.get.mockRejectedValueOnce(mockError);

      await expect(getLoggedInUser()).rejects.toBe(mockError);

      expect(mockConsoleError).toHaveBeenCalledWith('Error fetching current user:', mockError);
    });

    it('should handle 500 Internal Server Error', async () => {
      const mockError = {
        message: 'Request failed with status code 500',
        response: {
          status: 500,
          statusText: 'Internal Server Error',
          data: { message: 'Database error' },
        },
      };

      mockApiClient.get.mockRejectedValueOnce(mockError);

      await expect(getLoggedInUser()).rejects.toBe(mockError);

      expect(mockConsoleError).toHaveBeenCalledWith('Error fetching current user:', mockError);
    });
  });
});