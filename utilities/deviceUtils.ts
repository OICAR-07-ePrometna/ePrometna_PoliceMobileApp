import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Application from 'expo-application';

export async function getDeviceInfo() {
  try {
    //Get device info
    const deviceType = await Device.getDeviceTypeAsync();
    const deviceName = Device.deviceName || 'Unknown Device';
    const brand = (Device.brand || 'Unknown');
    const modelName = (Device.modelName || 'Unknown');
    const osName = Platform.OS;
    const osVersion = (Device.osVersion || 'Unknown');
    
    let deviceId = '';
    
    if (Platform.OS === 'android') {
      const androidId = await Application.getAndroidId() || '';
      deviceId = androidId.substring(0, 10);
    } else if (Platform.OS === 'ios') {
      const iosId = await Application.getIosIdForVendorAsync() || '';
      deviceId = iosId.substring(0, 10);
    } else {
      deviceId = Math.random().toString(36).substring(2, 12);
    }
    
    return {
      platform: Platform.OS.substring(0, 5),
      brand: brand.substring(0, 10),
      modelName: modelName.substring(0, 15),
      deviceName: deviceName.substring(0, 10),
      osName: osName.substring(0, 5),
      osVersion: osVersion.substring(0, 10),
      deviceId: deviceId.substring(0, 10),
      appVersion: (Application.nativeApplicationVersion || '1.0.0').substring(0, 5),
      buildVersion: (Application.nativeBuildVersion || '1').substring(0, 5)
    };
  } catch (error) {
    console.error('Error getting device info:', error);
    
    return {
      platform: Platform.OS.substring(0, 5),
      brand: 'Unknown',
      modelName: 'Unknown',
      deviceName: 'Unknown',
      deviceId: Math.random().toString(36).substring(2, 12),
      osName: Platform.OS.substring(0, 5),
      osVersion: 'Unknown'
    };
  }
}