// services/tempDataService.ts
import apiClient from './axios';
import type { UserDto } from '@/dtos/userDto';
import type { VehicleDetailsDto } from '@/dtos/vehicleDetailsDto';

export interface TempDataDto {
  vehicleUuid: string;
  driverUuid: string;
}

export interface ScannedDataResult {
  tempData: TempDataDto;
  vehicle: VehicleDetailsDto;
  driver: UserDto;
}

/**
 * Scans QR code and retrieves temporary data along with vehicle and driver details
 * First calls PUT to get and delete temp data, then fetches additional details
 */
export async function scanQRCodeAndGetData(tempDataUuid: string): Promise<ScannedDataResult> {
  try {
    console.log('Scanning QR code with UUID:', tempDataUuid);
    
    // Step 1: Call the PUT endpoint to get and delete temp data
    // This should return { vehicleUuid: string, driverUuid: string }
    console.log('Step 1: Calling PUT /tempdata/' + tempDataUuid);
    const tempDataResponse = await apiClient.put(`/tempdata/${tempDataUuid}`);
    console.log('PUT response:', tempDataResponse.data);
    
    const tempData: TempDataDto = tempDataResponse.data;
    
    if (!tempData.vehicleUuid || !tempData.driverUuid) {
      console.error('Missing UUIDs in temp data response:', tempData);
      throw new Error('Neispravni podaci u QR kodu');
    }

    console.log('Temp data retrieved and deleted. Vehicle UUID:', tempData.vehicleUuid, 'Driver UUID:', tempData.driverUuid);

    // Step 2: Fetch vehicle details using the UUID we got from temp data
    console.log('Step 2: Fetching vehicle details for UUID:', tempData.vehicleUuid);
    const vehicleResponse = await apiClient.get(`/vehicle/${tempData.vehicleUuid}`);
    console.log('Vehicle response status:', vehicleResponse.status);
    const vehicle: VehicleDetailsDto = vehicleResponse.data;

    // Step 3: Fetch driver details using the UUID we got from temp data  
    console.log('Step 3: Fetching driver details for UUID:', tempData.driverUuid);
    const driverResponse = await apiClient.get(`/user/${tempData.driverUuid}`);
    console.log('Driver response status:', driverResponse.status);
    const driver: UserDto = driverResponse.data;

    console.log('All data retrieved successfully');

    return {
      tempData,
      vehicle,
      driver
    };

  } catch (error: any) {
    console.error('Error scanning QR code and retrieving data:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url,
      uuid: tempDataUuid
    });

    // Handle specific error cases
    if (error.response?.status === 404) {
      throw new Error('QR kod nije valjan ili je već korišten');
    } else if (error.response?.status === 410) {
      throw new Error('QR kod je istekao (5 minuta)');
    } else if (error.response?.status === 401) {
      throw new Error('Nemate dozvolu za skeniranje QR kodova');
    } else {
      throw new Error(`Greška pri skeniranju QR koda: ${error.message}`);
    }
  }
}