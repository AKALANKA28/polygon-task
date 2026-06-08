export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'employee';
  avatar_url: string | null;
  department?: string;
  phone?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
}
