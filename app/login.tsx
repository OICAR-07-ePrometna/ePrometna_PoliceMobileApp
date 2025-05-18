import { View, StyleSheet } from 'react-native';
import React from 'react';
import PoliceLoginView from '@/components/PoliceLogin';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import { useEffect } from 'react';

export default function LoginScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  
  // If user is already authenticated, redirect to tabs
  useEffect(() => {
    const checkAuth = async () => {
      if (await isAuthenticated()) {
        router.replace('/(tabs)');
      }
    };
    
    checkAuth();
  }, []);
  
  return (
    <View style={styles.container} accessibilityLabel="Login Screen">
      <PoliceLoginView />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});