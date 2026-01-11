import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const API_URL = __DEV__
  ? Platform.OS === 'android'
    ? 'http://10.0.2.2:4000/api/v1' // Android emulator
    : 'http://localhost:4000/api/v1' // iOS simulator
  : 'https://your-production-api.com/api/v1';

const SESSION_TOKEN_KEY = 'session_token';

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor to add session token
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await SecureStore.getItemAsync(SESSION_TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Clear stored session on unauthorized
      await SecureStore.deleteItemAsync(SESSION_TOKEN_KEY);
    }
    return Promise.reject(error);
  }
);

// Session management helpers
export const setSessionToken = async (token: string) => {
  await SecureStore.setItemAsync(SESSION_TOKEN_KEY, token);
};

export const clearSessionToken = async () => {
  await SecureStore.deleteItemAsync(SESSION_TOKEN_KEY);
};

export const getSessionToken = async () => {
  return await SecureStore.getItemAsync(SESSION_TOKEN_KEY);
};
