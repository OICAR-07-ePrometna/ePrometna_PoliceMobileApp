import axios, { AxiosError } from 'axios';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import { DEVICE_TOKEN_KEY, ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, USER_DATA_KEY } from '@/utilities/tokenUtils';

const getExpoDebuggerIP = () => {
  try {
    const expoConfig = Constants.expoConfig as any;
    const manifest = Constants.manifest as any;
    
    const expoGo = expoConfig?.extra?.expoGo?.debuggerHost || manifest?.debuggerHost;
    
    if (expoGo) {
      return expoGo.split(':').shift();
    }
  } catch (error) {
    console.log('Error getting Expo debugger IP:', error);
  }
  return null;
};

export function getBaseUrl(): string {
  let baseURL = 'http://localhost:8090/api';

  if (__DEV__) {
    console.log('Platform:', Platform.OS);
    
    const expoDebuggerIP = getExpoDebuggerIP();
    const localIP = Constants.expoConfig?.extra?.localIP;
    const emulatorIP = Constants.expoConfig?.extra?.emulatorIP;

    switch (Platform.OS) {
      case 'web':
        baseURL = 'http://localhost:8090/api';
        break;
        
      case 'android':
        if (expoDebuggerIP) {
          baseURL = `http://${expoDebuggerIP}:8090/api`;
        } else if (emulatorIP) {
          baseURL = `http://${emulatorIP}:8090/api`;
        }
        break;
        
      case 'ios':
        if (expoDebuggerIP) {
          baseURL = `http://${expoDebuggerIP}:8090/api`;
        } else if (localIP) {
          baseURL = `http://${localIP}:8090/api`;
        }
        break;
    }
    
    console.log('Base URL:', baseURL);
  }
  
  return baseURL;
}

const apiClient = axios.create({
  baseURL: getBaseUrl(),
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

//Request
apiClient.interceptors.request.use(
  async (config) => {  
    try {
      const deviceToken = await SecureStore.getItemAsync(DEVICE_TOKEN_KEY);
      if (deviceToken) {
        config.headers.Authorization = `Bearer ${deviceToken}`;
        return config;
      }
      
      const accessToken = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    } catch (error) {
      console.error('Error accessing secure storage:', error);
    }
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

//Response
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {

    if (error.response?.status === 401) {
      try {
        const authStore = await import('@/stores/authStore').then(module => module.useAuthStore.getState());
        await authStore.logout();
      } catch (logoutError) {
        console.error('Error during logout after 401:', logoutError);
      }
    }
    
    return Promise.reject(error);
  }
);

export const safeInstance = axios.create({
  baseURL: getBaseUrl(),
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

safeInstance.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => Promise.reject(error)
);

safeInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;