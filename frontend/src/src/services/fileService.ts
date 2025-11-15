import axios from 'axios';
import { User } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

export const fileService = {
  async uploadResume(file: File, onProgress?: (progress: number) => void): Promise<{ user: User; fileUrl: string }> {
    const formData = new FormData();
    formData.append('file', file);
    
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found. Please login again.');
    }

    try {
      const response = await axios.post<{ user: User; fileUrl: string; message: string }>(
        `${API_BASE_URL}/files/upload/resume`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            // Don't set Content-Type - axios will set it automatically with boundary for multipart/form-data
          },
          onUploadProgress: (progressEvent) => {
            if (onProgress && progressEvent.total) {
              const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              onProgress(progress);
            }
          },
          timeout: 60000, // 60 second timeout for file uploads
        }
      );
      return { user: response.data.user, fileUrl: response.data.fileUrl };
    } catch (error: any) {
      console.error('File upload error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers,
      });
      throw error;
    }
  },

  async uploadProfilePicture(file: File, onProgress?: (progress: number) => void): Promise<{ user: User; fileUrl: string }> {
    const formData = new FormData();
    formData.append('file', file);
    
    const token = localStorage.getItem('token');
    const response = await axios.post<{ user: User; fileUrl: string; message: string }>(
      `${API_BASE_URL}/files/upload/profile-picture`,
      formData,
      {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
          // Don't set Content-Type - axios will set it automatically with boundary for multipart/form-data
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(progress);
          }
        },
      }
    );
    return { user: response.data.user, fileUrl: response.data.fileUrl };
  },

  async deleteResume(): Promise<User> {
    const token = localStorage.getItem('token');
    const response = await axios.delete<{ user: User; message: string }>(
      `${API_BASE_URL}/files/resume`,
      {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
      }
    );
    return response.data.user;
  },
};

