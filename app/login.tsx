import { View, StyleSheet } from 'react-native';
import React from 'react';
import PoliceLoginView from '@/components/PoliceLogin';

export default function LoginScreen() {
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