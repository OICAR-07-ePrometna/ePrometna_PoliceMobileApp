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
  
  login: (email: string, password: string, rememberDevice: boolean) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: () => Promise<boolean>;
  getUserRole: () => UserRole | undefined;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  deviceToken: null,
  accessToken: null,
  refreshToken: null,
  userData: null,
  loading: false,
  error: null,

  login: async (email: string, password: string, rememberDevice: boolean) => {
    set({ loading: true, error: null });
    try {
      const { accessToken, refreshToken, deviceToken } = await authService.loginMobile({
        email,
        password
      });
      
      console.log('Login successful, received all tokens');
      
      if (!accessToken || !refreshToken || !deviceToken) {
        throw new Error('Invalid response from server: missing tokens');
      }
    
      const userData = tokenUtils.getUserFromToken(deviceToken);
      
      if (rememberDevice) {
        await tokenUtils.storeTokens(deviceToken, accessToken, refreshToken);
        
        if (userData) {
          await SecureStore.setItemAsync(tokenUtils.USER_DATA_KEY, JSON.stringify(userData));
        }
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

  getUserRole: () => {
    return get().userData?.role;
  }
}));