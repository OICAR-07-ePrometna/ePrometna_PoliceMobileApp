import { Redirect } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { 
  DEVICE_TOKEN_KEY, 
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  USER_DATA_KEY 
} from '@/utilities/tokenUtils';

export default function Index() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const authStore = useAuthStore();

  const forceLogout = async () => {
    console.log('Force logout initiated');
    try {
      // Clear secure store
      await SecureStore.deleteItemAsync(DEVICE_TOKEN_KEY);
      await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
      await SecureStore.deleteItemAsync(USER_DATA_KEY);
    
      authStore.logout();
      
      setIsAuthenticated(false);
      console.log('Force logout complete');
    } catch (error) {
      console.error('Force logout error:', error);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authenticated = await authStore.isAuthenticated();
        console.log('isAuthenticated returned:', authenticated);
        setIsAuthenticated(authenticated);
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={forceLogout}
        >
          <Text style={styles.logoutButtonText}>Force Logout</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // If user is authenticated, redirect to the tabs
  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  // If not authenticated, redirect to login
  return <Redirect href="/login" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutButton: {
    backgroundColor: '#ff3b30',
    padding: 12,
    borderRadius: 6,
    marginTop: 20,
  },
  logoutButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});