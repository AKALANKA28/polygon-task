import { api } from './api';
import { AuthResponse, LoginCredentials } from '../types/auth.types';

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', credentials);
    return response as unknown as AuthResponse;
  },
};
