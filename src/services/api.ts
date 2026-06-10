import axios from 'axios';
import { storage } from '../utils/storage';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';
console.log('[API] Initializing Axios client. BASE_URL =', BASE_URL);

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor: attach JWT
api.interceptors.request.use(async (config) => {
  const token = await storage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: unwrap data and handle 401
api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    console.error('[API Error Interceptor] Request failed:', {
      message: error.message,
      code: error.code,
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      responseData: error.response?.data,
    });
    if (error.response?.status === 401) {
      await storage.removeItem('token');
      await storage.removeItem('user');
      // Auth guard in root layout will handle redirect
    }
    return Promise.reject(error);
  }
);
