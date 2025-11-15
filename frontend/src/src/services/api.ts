import axios, { AxiosInstance, AxiosResponse } from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

class ApiService {
  private api: AxiosInstance;
  private networkErrorShown = false;
  private readonly NETWORK_ERROR_RESET_TIME = 5000; // Reset flag after 5 seconds

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle errors
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      (error) => {
        // Handle network errors (backend not available)
        if (!error.response) {
          // Network error - backend is likely not running
          const url = error.config?.url || '';
          const fullUrl = error.config?.baseURL ? `${error.config.baseURL}${url}` : url;
          const isAuthEndpoint = url.includes('/auth/') || fullUrl.includes('/auth/');
          
          // Don't show network error for auth endpoints - they handle it themselves
          // Only show for other endpoints
          if (!isAuthEndpoint && !this.networkErrorShown) {
            this.networkErrorShown = true;
            toast.error('Cannot connect to server. Please make sure the backend is running.', {
              duration: 5000,
              id: 'network-error', // Use same ID to prevent duplicates
            });
            // Reset flag after timeout
            setTimeout(() => {
              this.networkErrorShown = false;
            }, this.NETWORK_ERROR_RESET_TIME);
          }
          // Don't show any toast for auth endpoints - let AuthContext handle it
          return Promise.reject(error);
        }

        // Handle HTTP response errors
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        } else if (error.response?.status >= 500) {
          toast.error('Server error. Please try again later.', {
            id: `server-error-${error.response.status}`,
          });
        } else if (error.response?.data?.message) {
          toast.error(error.response.data.message, {
            id: `api-error-${error.config?.url}`,
          });
        }
        return Promise.reject(error);
      }
    );
  }

  // Generic methods
  async get<T>(url: string, params?: any): Promise<T> {
    const response = await this.api.get<T>(url, { params });
    return response.data;
  }

  async post<T>(url: string, data?: any): Promise<T> {
    const response = await this.api.post<T>(url, data);
    return response.data;
  }

  async put<T>(url: string, data?: any): Promise<T> {
    const response = await this.api.put<T>(url, data);
    return response.data;
  }

  async delete<T>(url: string): Promise<T> {
    const response = await this.api.delete<T>(url);
    return response.data;
  }

  async patch<T>(url: string, data?: any): Promise<T> {
    const response = await this.api.patch<T>(url, data);
    return response.data;
  }

  // File upload
  async uploadFile<T>(url: string, file: File, onProgress?: (progress: number) => void): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await this.api.post<T>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });

    return response.data;
  }

  // Set auth token
  setAuthToken(token: string) {
    localStorage.setItem('token', token);
  }

  // Remove auth token
  removeAuthToken() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  // Get auth token
  getAuthToken(): string | null {
    return localStorage.getItem('token');
  }
}

export const apiService = new ApiService();
export default apiService;
