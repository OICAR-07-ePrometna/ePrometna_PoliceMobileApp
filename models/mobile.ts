export interface Mobile {
  uuid: string;
  userId?: number;
  creatorId: number;
  registeredDevice: string;
  activationToken: string;
  createdAt?: string;
  updatedAt?: string;
}


export interface RegisterDeviceRequest {
  email: string;
  password: string;
  deviceInfo: {
    platform: string;
    brand: string;
    modelName: string;
    deviceId: string;
    osVersion?: string;
  };
}

export interface DeviceRegistrationResponse {
  device: Mobile;
  token: string;
}

export interface ActivateDeviceRequest {
  activationToken: string;
  deviceId: string;
}