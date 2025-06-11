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

export async function scanQRCodeAndGetData(tempDataUuid: string): Promise<ScannedDataResult> {
  try {
    //Call PUT to get and delete temp data
    const tempDataResponse = await apiClient.put(`/tempdata/${tempDataUuid}`);
    
    const tempData: TempDataDto = tempDataResponse.data;
    
    if (!tempData.vehicleUuid || !tempData.driverUuid) {
      throw new Error('Neispravni podaci u QR kodu');
    }

    //Fetch vehicle details using the UUID
    const vehicleResponse = await apiClient.get(`/vehicle/${tempData.vehicleUuid}`);
    const vehicle: VehicleDetailsDto = vehicleResponse.data;

    //Fetch driver details using the UUID 
    const driverResponse = await apiClient.get(`/user/${tempData.driverUuid}`);
    const driver: UserDto = driverResponse.data;

    return {
      tempData, vehicle, driver
    };

  } catch (error: any) {
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