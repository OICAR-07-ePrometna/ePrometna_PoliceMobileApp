import { View } from 'react-native';
import React from 'react';
import PingTest from '@/components/PingTest';

export default function PingTestScreen() {
  return (
    <View style={{ flex: 1 }} accessibilityLabel="Ping Test Screen">
      <PingTest />
    </View>
  );
}