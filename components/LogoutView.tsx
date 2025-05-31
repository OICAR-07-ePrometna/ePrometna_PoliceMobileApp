//KORISTI SE ZA TESTIRANJE, DELETE KASNIJE
import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'expo-router';

const LogoutView: React.FC = () => {
  const { logout } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    const performLogout = async () => {
      try {
        console.log('Starting logout process...');
        await logout();
        console.log('Logout successful, redirecting to login');
        router.replace('/login');
      } catch (error) {
        console.error('Error during logout:', error);
        router.replace('/login');
      }
    };

    performLogout();
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#007AFF" />
      <Text style={styles.text}>Logging out...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  text: {
    marginTop: 20,
    fontSize: 16,
    color: '#333',
  },
});

export default LogoutView;