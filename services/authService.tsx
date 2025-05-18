import { AxiosError } from 'axios';
import { getDeviceInfo } from '@/utilities/deviceUtils';
import type { LoginDto } from '@/dtos/loginDto';
import type { ApiError } from '@/models/apiErrors';
import apiClient, { safeInstance } from '@/services/axios';
import axios from 'axios';

export interface MobileLoginResponse {
  accessToken: string;
  refreshToken: string;
  deviceToken: string;
}

export async function loginMobile(credentials: LoginDto): Promise<MobileLoginResponse> {
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
    
    const response = await safeInstance.post<MobileLoginResponse>('/auth/login-mobile', loginPayload);
    
    console.log('Login mobile tokens received:', {
      accessToken: response.data.accessToken ? 'Yes' : 'No',
      refreshToken: response.data.refreshToken ? 'Yes' : 'No',
      deviceToken: response.data.deviceToken ? 'Yes' : 'No'
    });
    
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiError>;
      console.error('Login error response:', axiosError.response?.data);
      throw new Error(axiosError.response?.data?.message || 'Login failed');
    }
    console.error('Unexpected login error:', error);
    throw new Error('An unexpected error occurred during login');
  }
}

export async function loginPolice(token: string): Promise<MobileLoginResponse> {
  try {
    // Get device information
    const deviceInfo = await getDeviceInfo();
  
    const loginPayload = {
      token,
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
    
    const response = await safeInstance.post<MobileLoginResponse>('/auth/login-police', loginPayload);
    
    console.log('Police login tokens received:', {
      accessToken: response.data.accessToken ? 'Yes' : 'No',
      refreshToken: response.data.refreshToken ? 'Yes' : 'No',
      deviceToken: response.data.deviceToken ? 'Yes' : 'No'
    });
    
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiError>;
      console.error('Police login error response:', axiosError.response?.data);
      throw new Error(axiosError.response?.data?.message || 'Login failed');
    }
    console.error('Unexpected login error:', error);
    throw new Error('An unexpected error occurred during login');
  }
}

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