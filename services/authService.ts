import { AxiosError } from 'axios';
import { getDeviceInfo } from '@/utilities/deviceUtils';
import type { LoginDto } from '@/dtos/loginDto';
import type { PoliceRegisterDto } from '@/dtos/policeRegisterDto';
import type { ApiError } from '@/models/apiErrors';
import apiClient, { safeInstance } from '@/services/axios';
import axios from 'axios';

export interface MobileLoginResponse {
  accessToken: string;
  refreshToken: string;
  deviceToken: string;
}

// Device reg
export async function registerMobile(credentials: LoginDto): Promise<MobileLoginResponse> {
  try {
    // Get device information
    const deviceInfo = await getDeviceInfo();
  
    const loginPayload = {
      email: credentials.email,
      password: credentials.password,
      deviceInfo: {
        platform: deviceInfo.platform,
        brand: deviceInfo.brand,
        modelName: deviceInfo.modelName,
        deviceId: deviceInfo.deviceId,
        osName: deviceInfo.osName,
        osVersion: deviceInfo.osVersion,
        appVersion: deviceInfo.appVersion,
        buildVersion: deviceInfo.buildVersion
      }
    };
    
    const response = await safeInstance.post<MobileLoginResponse>('/auth/user/register', loginPayload);
    
    console.log('Mobile registration tokens received:', {
      accessToken: response.data.accessToken ? 'Yes' : 'No',
      refreshToken: response.data.refreshToken ? 'Yes' : 'No',
      deviceToken: response.data.deviceToken ? 'Yes' : 'No'
    });
    
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiError>;
      console.error('Mobile registration error response:', axiosError.response?.data);
      throw new Error(axiosError.response?.data?.message || 'Mobile registration failed');
    }
    console.error('Unexpected mobile registration error:', error);
    throw new Error('An unexpected error occurred during mobile registration');
  }
}

//Police registration with code
export async function registerPolice(token: string): Promise<MobileLoginResponse> {
  try {
    // Get device information
    const deviceInfo = await getDeviceInfo();
  
    const loginPayload: PoliceRegisterDto = {
      Code: token,
      DeviceInfo: {
        Platform: deviceInfo.platform,
        Brand: deviceInfo.brand,
        ModelName: deviceInfo.modelName,
        DeviceID: deviceInfo.deviceId
      }
    };
    
    const response = await safeInstance.post<MobileLoginResponse>('/auth/police/register', loginPayload);
    
    console.log('Police registration tokens received:', {
      accessToken: response.data.accessToken ? 'Yes' : 'No',
      refreshToken: response.data.refreshToken ? 'Yes' : 'No',
      deviceToken: response.data.deviceToken ? 'Yes' : 'No'
    });
    
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiError>;
      console.error('Police registration error response:', axiosError.response?.data);
      throw new Error(axiosError.response?.data?.message || 'Police registration failed');
    }
    console.error('Unexpected police registration error:', error);
    throw new Error('An unexpected error occurred during police registration');
  }
}

// Regular login for existing users
export async function login(credentials: LoginDto) {
  try {
    const response = await safeInstance.post('/auth/login', credentials);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiError>;
      throw new Error(axiosError.response?.data?.message || 'Login failed');
    }
    throw new Error('An unexpected error occurred during login');
  }
}

export async function logoutDevice(): Promise<void> {
  try {
    //KORISTI SE ZA TESTIRANJE, DELETE KASNIJE
    await apiClient.post('/auth/logout-device');
  } catch (error) {
    console.error('Error during device logout:', error);
  }
}