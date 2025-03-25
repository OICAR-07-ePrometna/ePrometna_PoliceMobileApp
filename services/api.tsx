import axios, { AxiosError } from 'axios';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

const localIP = Constants.expoConfig?.extra?.localIP;
const emulatorIP = Constants.expoConfig?.extra?.emulatorIP;

const getExpoDebuggerIP = () => {
  try {
    const expoConfig = Constants.expoConfig as any;
    const manifest = Constants.manifest as any;
    
    const expoGo = expoConfig?.extra?.expoGo?.debuggerHost || manifest?.debuggerHost;
    
    if (expoGo) {
      return expoGo.split(':').shift();
    }
  } catch (error) {
    console.log(error);
  }
  return null;
};

const getBaseUrl = () => {
  let baseURL = 'http://localhost:8090';

  console.log('Platform:', Platform.OS);

  switch (Platform.OS) {
    case 'web':
      baseURL = 'http://localhost:8090';
      break;
      
    case 'android':
      const androidIP = getExpoDebuggerIP();
      if (androidIP) {
        baseURL = `http://${androidIP}:8090`;
      } else {
        baseURL = `http://${emulatorIP}:8090`;
      }
      break;
      
    case 'ios':
      const iosIP = getExpoDebuggerIP();
      if (iosIP) {
        baseURL = `http://${iosIP}:8090`;
      } else {
        baseURL = `http://${localIP}:8090`;
      }
      break;
      
    default:
      baseURL = 'http://localhost:8090';
      break;
  }

  if (__DEV__) {
    console.log('Base URL:', baseURL);
  }
  
  return baseURL;
};

const api = axios.create({
  baseURL: getBaseUrl(),
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

//Request
api.interceptors.request.use(
  config => {
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  error => {
    console.error(error);
    return Promise.reject(error);
  }
);

//Response
api.interceptors.response.use(
  response => {
    if (__DEV__) {
      console.log('API Response:', response.status);
    }
    return response;
  },
  (error: AxiosError) => {
    if (__DEV__) {
      console.error('API Response Error:', error.response?.status, error.response?.data);
    }
    return Promise.reject(error);
  }
);

export default api;