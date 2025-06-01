import { View } from 'react-native';
import React from 'react';
import QRScanner from '@/components/QRScanner';

export default function ScanQrCodeScreen() {
  return (
    <View style={{ flex: 1 }} accessibilityLabel="QR Code Scanner Screen">
      <QRScanner />
    </View>
  );
}