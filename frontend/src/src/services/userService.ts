import apiService from './api';
import { User } from '../types';

export const userService = {
  async getProfile(): Promise<User> {
    const response = await apiService.get<User>('/users/profile');
    return response;
  },

  async updateProfile(profileData: Partial<User>): Promise<User> {
    const response = await apiService.put<User>('/users/profile', profileData);
    return response;
  },

  async updatePassword(newPassword: string): Promise<void> {
    return apiService.put<void>('/users/password', { newPassword });
  },

  async updateProfilePicture(profilePictureUrl: string): Promise<User> {
    const response = await apiService.put<{ user: User }>('/users/profile-picture', { profilePictureUrl });
    return response.user;
  },

  async updateResume(resumeUrl: string): Promise<User> {
    const response = await apiService.put<{ user: User }>('/users/resume', { resumeUrl });
    return response.user;
  },

  async getUserById(id: number): Promise<User> {
    const response = await apiService.get<{ user: User }>(`/users/${id}`);
    return response.user;
  },

  async getAllUsers(): Promise<User[]> {
    const response = await apiService.get<{ users: User[] }>('/users');
    return response.users;
  },

  async getUsersByRole(role: User['role']): Promise<User[]> {
    const response = await apiService.get<{ users: User[] }>(`/users/role/${role}`);
    return response.users;
  },

  async verifyUser(id: number): Promise<void> {
    return apiService.post<void>(`/users/${id}/verify`);
  },
};
