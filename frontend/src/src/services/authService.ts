import apiService from './api';
import { LoginRequest, RegisterRequest, AuthResponse, User } from '../types';

export const authService = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await apiService.post<AuthResponse>('/auth/login', credentials);
    apiService.setAuthToken(response.token);
    return response;
  },

  async register(userData: RegisterRequest): Promise<User> {
    const response = await apiService.post<{ user: User }>('/auth/register', userData);
    return response.user;
  },

  async logout(): Promise<void> {
    try {
      await apiService.post('/auth/logout');
    } finally {
      apiService.removeAuthToken();
    }
  },

  async getCurrentUser(): Promise<User> {
    const response = await apiService.get<{ user: User }>('/auth/me');
    return response.user;
  },

  isAuthenticated(): boolean {
    return !!apiService.getAuthToken();
  },

  getStoredUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  },

  storeUser(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
  },

  removeStoredUser(): void {
    localStorage.removeItem('user');
  },

  getAuthToken(): string | null {
    return apiService.getAuthToken();
  },

  removeAuthToken(): void {
    apiService.removeAuthToken();
  },
};
