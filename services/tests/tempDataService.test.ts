import { scanQRCodeAndGetData } from '@/services/tempDataService';
import apiClient from '@/services/axios';
import type { UserDto } from '@/dtos/userDto';
import type { VehicleDetailsDto } from '@/dtos/vehicleDetailsDto';

// Mock api
jest.mock('@/services/axios', () => ({
  __esModule: true,
  default: {
    put: jest.fn(),
    get: jest.fn(),
  },
}));

const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation();

describe('scanQRCodeAndGetData', () => {
  const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;
  const mockTempDataUuid = 'temp-data-uuid-123';

  const mockTempData = {
    vehicleUuid: 'vehicle-uuid-456',
    driverUuid: 'driver-uuid-789',
  };

  const mockVehicle: VehicleDetailsDto = {
    uuid: 'vehicle-uuid-456',
    registration: 'ABC-123',
    owner: {
      uuid: 'owner-uuid-123',
      firstName: 'Jane',
      lastName: 'Smith',
      oib: '12345678901',
      residence: 'Zagreb, Croatia',
      birthDate: '1980-03-20',
      email: 'owner@example.com',
      role: 'user',
    },
    drivers: [
      {
        uuid: 'driver-uuid-789',
        firstName: 'John',
        lastName: 'Doe',
        oib: '98765432109',
        residence: 'Split, Croatia',
        birthDate: '1985-05-15',
        email: 'driver@example.com',
        role: 'user',
      },
    ],
    pastOwners: [],
    summary: {
        vehicleCategory: 'test',
        mark: 'test',
        homologationType: 'test',
        tradeName: 'test',
        chassisNumber: 'test',
        bodyShape: 'test',
        vehicleUse: 'test',
        dateFirstRegistration: 'test',
        firstRegistrationInCroatia: 'test',
        technicallyPermissibleMaximumLadenMass: 'test',
        permissibleMaximumLadenMass: 'test',
        unladenMass: 'test',
        permissiblePayload: 'test',
        typeApprovalNumber: 'test',
        engineCapacity: 'test',
        enginePower: 'test',
        fuelOrPowerSource: 'test',
        ratedEngineSpeed: 'test',
        numberOfSeats: 'test',
        colourOfVehicle: 'test',
        length: 'test',
        width: 'test',
        height: 'test',
        maximumNetPower: 'test',
        numberOfAxles: 'test',
        numberOfDrivenAxles: 'test',
        mb: 'test',
        stationaryNoiseLevel: 'test',
        engineSpeedForStationaryNoiseTest: 'test',
        co2Emissions: 'test',
        ecCategory: 'test',
        tireSize: 'test',
        uniqueModelCode: 'test',
        model: 'test',
        additionalTireSizes: 'test',
        vehicleType: 'test'
    }
  };

  const mockDriver: UserDto = {
    uuid: 'driver-uuid-789',
    firstName: 'John',
    lastName: 'Doe',
    oib: '98765432109',
    residence: 'Split, Croatia',
    birthDate: '1985-05-15',
    email: 'driver@example.com',
    role: 'user',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    mockConsoleLog.mockRestore();
    mockConsoleError.mockRestore();
  });

  describe('successful QR code scanning', () => {
    it('should scan QR code and return complete data', async () => {
      // Mock PUT
      mockApiClient.put.mockResolvedValueOnce({
        data: mockTempData,
        status: 200,
      });

      // Mock GET
      mockApiClient.get.mockResolvedValueOnce({
        data: mockVehicle,
        status: 200,
      });

      // Mock GET
      mockApiClient.get.mockResolvedValueOnce({
        data: mockDriver,
        status: 200,
      });

      const result = await scanQRCodeAndGetData(mockTempDataUuid);

      expect(mockApiClient.put).toHaveBeenCalledWith(`/tempdata/${mockTempDataUuid}`);
      expect(mockApiClient.get).toHaveBeenCalledWith(`/vehicle/${mockTempData.vehicleUuid}`);
      expect(mockApiClient.get).toHaveBeenCalledWith(`/user/${mockTempData.driverUuid}`);

      expect(result).toEqual({
        tempData: mockTempData,
        vehicle: mockVehicle,
        driver: mockDriver,
      });
    });

    it('should handle different HTTP status codes', async () => {
      mockApiClient.put.mockResolvedValueOnce({
        data: mockTempData,
        status: 201,
      });

      mockApiClient.get.mockResolvedValueOnce({
        data: mockVehicle,
        status: 201,
      });

      mockApiClient.get.mockResolvedValueOnce({
        data: mockDriver,
        status: 201,
      });

      const result = await scanQRCodeAndGetData(mockTempDataUuid);

      expect(result).toEqual({
        tempData: mockTempData,
        vehicle: mockVehicle,
        driver: mockDriver,
      });
    });
  });

  describe('validation errors', () => {
    it('should throw error when vehicleUuid is missing', async () => {
      const invalidTempData = {
        vehicleUuid: '',
        driverUuid: 'driver-uuid-789',
      };

      mockApiClient.put.mockResolvedValueOnce({
        data: invalidTempData,
        status: 200,
      });

      await expect(scanQRCodeAndGetData(mockTempDataUuid)).rejects.toThrow('Neispravni podaci u QR kodu');
      expect(mockApiClient.get).not.toHaveBeenCalled();
    });

    it('should throw error when driverUuid is missing', async () => {
      const invalidTempData = {
        vehicleUuid: 'vehicle-uuid-456',
        driverUuid: '',
      };

      mockApiClient.put.mockResolvedValueOnce({
        data: invalidTempData,
        status: 200,
      });

      await expect(scanQRCodeAndGetData(mockTempDataUuid)).rejects.toThrow('Neispravni podaci u QR kodu');
      expect(mockApiClient.get).not.toHaveBeenCalled();
    });
  });

  describe('HTTP error handling', () => {
    it('should handle 404 error (QR code not found or already used)', async () => {
      const mockError = {
        message: 'Not Found',
        response: {
          status: 404,
          statusText: 'Not Found',
          data: { message: 'Temp data not found' },
        },
        config: {
          url: `/tempdata/${mockTempDataUuid}`,
        },
      };

      mockApiClient.put.mockRejectedValueOnce(mockError);
      await expect(scanQRCodeAndGetData(mockTempDataUuid)).rejects.toThrow('QR kod nije valjan ili je već korišten');
    });

    it('should handle 401 error (unauthorized)', async () => {
      const mockError = {
        message: 'Unauthorized',
        response: {
          status: 401,
          statusText: 'Unauthorized',
          data: { message: 'No permission to scan QR codes' },
        },
        config: {
          url: `/tempdata/${mockTempDataUuid}`,
        },
      };

      mockApiClient.put.mockRejectedValueOnce(mockError);
      await expect(scanQRCodeAndGetData(mockTempDataUuid)).rejects.toThrow('Nemate dozvolu za skeniranje QR kodova');
    });
  });
});