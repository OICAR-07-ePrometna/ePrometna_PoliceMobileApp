import { create } from 'zustand';
import type { User } from '@/models/user';
import { UserRole } from '@/enums/userRole';
import * as authService from '@/services/authService';
import * as tokenUtils from '@/utilities/tokenUtils';
import * as SecureStore from 'expo-secure-store';

interface AuthState {
  deviceToken: string | null;
  accessToken: string | null;
  refreshToken: string | null;
  userData: User | null;
  loading: boolean;
  error: string | null;
  
  registerPolice: (token: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: () => Promise<boolean>;
  getUserRole: () => UserRole | undefined;
  isDeviceRegistered: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  deviceToken: null,
  accessToken: null,
  refreshToken: null,
  userData: null,
  loading: false,
  error: null,

  //Prvi login
  registerPolice: async (token: string) => {
    set({ loading: true, error: null });
    try {
      const { accessToken, refreshToken, deviceToken } = await authService.registerPolice(token);
      console.log('Received deviceToken:', deviceToken);
      
      if (!accessToken || !refreshToken || !deviceToken) {
        throw new Error('Invalid response from server: missing tokens');
      }
    
      const userData = tokenUtils.getUserFromToken(deviceToken);
      await tokenUtils.storeTokens(deviceToken, accessToken, refreshToken);
      
      if (userData) {
        await SecureStore.setItemAsync(tokenUtils.USER_DATA_KEY, JSON.stringify(userData));
      }
    
      // Force update the store state
      set((state) => ({
        ...state,
        deviceToken: deviceToken,
        accessToken: accessToken,
        refreshToken: refreshToken,
        userData: userData,
        loading: false,
        error: null
      }));
    
      console.log('Police registration complete, deviceToken stored:', get().deviceToken);
      
    } catch (error) {
      let errorMessage = 'Police registration failed';
      
      if (error instanceof Error) {
        console.error('Police registration error:', error.message);
        errorMessage = error.message;
      }
      
      set({ error: errorMessage, loading: false });
      throw new Error(errorMessage);
    }
  },

  //Svaki sljedeci login
  login: async (email: string, password: string) => {
    set({ loading: true, error: null });
    try {
      const { accessToken, refreshToken } = await authService.login({ email, password });
      
      console.log('Login successful, received tokens');
      
      if (!accessToken || !refreshToken) {
        throw new Error('Invalid response from server: missing tokens');
      }

      // Get existing device token from storage
      const deviceToken = await tokenUtils.getToken(tokenUtils.DEVICE_TOKEN_KEY);
      if (!deviceToken) {
        throw new Error('Device not registered. Please register first.');
      }

      const userData = tokenUtils.getUserFromToken(deviceToken);
      
      // Update stored tokens
      await tokenUtils.storeTokens(deviceToken, accessToken, refreshToken);
      
      if (userData) {
        await SecureStore.setItemAsync(tokenUtils.USER_DATA_KEY, JSON.stringify(userData));
      }
      
      set({
        deviceToken,
        accessToken,
        refreshToken,
        userData,
        loading: false
      });
    } catch (error) {
      let errorMessage = 'Login failed';
      
      if (error instanceof Error) {
        console.error('Login error:', error.message);
        errorMessage = error.message;
      }
      
      set({ error: errorMessage, loading: false });
      throw new Error(errorMessage);
    }
  },

  logout: async () => {
    try {
      await authService.logoutDevice();
      await tokenUtils.clearTokens();

      set({
        deviceToken: null,
        accessToken: null,
        refreshToken: null,
        userData: null,
        error: null
      });
    } catch (error) {
      console.error('Logout error:', error);
      set({
        deviceToken: null,
        accessToken: null,
        refreshToken: null,
        userData: null
      });
    }
  },

  isAuthenticated: async () => {
    try {
      const deviceToken = await tokenUtils.getToken(tokenUtils.DEVICE_TOKEN_KEY);
      console.log('isAuthenticated checking device token:', deviceToken);
      return deviceToken !== null && deviceToken !== '';
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  },

  isDeviceRegistered: async () => {
    try {
      const deviceToken = await tokenUtils.getToken(tokenUtils.DEVICE_TOKEN_KEY);
      return deviceToken !== null && deviceToken !== '';
    } catch (error) {
      console.error('Error checking device registration:', error);
      return false;
    }
  },

  getUserRole: () => {
    return get().userData?.role;
  }
}));