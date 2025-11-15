import apiService from './api';
import { Notification, PaginatedResponse, PaginationParams } from '../types';

export const notificationService = {
  async getNotifications(params?: PaginationParams): Promise<PaginatedResponse<Notification>> {
    return apiService.get<PaginatedResponse<Notification>>('/notifications', params);
  },

  async getUnreadNotifications(): Promise<Notification[]> {
    return apiService.get<Notification[]>('/notifications/unread');
  },

  async getUnreadNotificationCount(): Promise<{ unreadCount: number }> {
    return apiService.get<{ unreadCount: number }>('/notifications/count');
  },

  async getNotificationById(id: number): Promise<Notification> {
    return apiService.get<Notification>(`/notifications/${id}`);
  },

  async markAsRead(id: number): Promise<Notification> {
    return apiService.put<Notification>(`/notifications/${id}/read`);
  },

  async markAllAsRead(): Promise<void> {
    return apiService.put<void>('/notifications/mark-all-read');
  },

  async deleteNotification(id: number): Promise<void> {
    return apiService.delete<void>(`/notifications/${id}`);
  },

  async deleteAllNotifications(): Promise<void> {
    return apiService.delete<void>('/notifications/all');
  },
};
