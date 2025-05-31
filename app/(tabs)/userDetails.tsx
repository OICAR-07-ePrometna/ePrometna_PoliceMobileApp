import { View } from 'react-native';
import React from 'react';
import UserDetails from '@/components/UserDetails';

export default function UserDetailsScreen() {
  return (
    <View style={{ flex: 1 }} accessibilityLabel="User Details Screen">
      <UserDetails />
    </View>
  );
}