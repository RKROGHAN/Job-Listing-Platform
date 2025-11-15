import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginRequest, RegisterRequest } from '../types';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = authService.getAuthToken();
        if (token) {
          const storedUser = authService.getStoredUser();
          if (storedUser) {
            setUser(storedUser);
          } else {
            // Try to fetch current user from API
            try {
              const currentUser = await authService.getCurrentUser();
              setUser(currentUser);
              authService.storeUser(currentUser);
            } catch (error) {
              // Token might be invalid, remove it
              authService.removeAuthToken();
            }
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginRequest) => {
    try {
      setLoading(true);
      const response = await authService.login(credentials);
      
      // Fetch user details
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
      authService.storeUser(currentUser);
      
      toast.success('Login successful!');
    } catch (error: any) {
      // Check if it's a network error (no response means network/server unavailable)
      // Network errors have no response object and may have specific error codes/messages
      const isNetworkError = !error.response && (
        error.code === 'ERR_NETWORK' || 
        error.code === 'ECONNREFUSED' ||
        error.message === 'Network Error' || 
        error.message?.includes('Network') ||
        error.message?.includes('Failed to fetch') ||
        error.message?.includes('timeout')
      );
      
      if (isNetworkError) {
        // Network error - backend not available
        toast.error('Cannot connect to server. Please make sure the backend is running.', {
          id: 'login-network-error',
          duration: 5000,
        });
        throw error;
      }
      
      // Handle HTTP response errors
      if (error.response?.status === 401) {
        toast.error('Invalid email or password. Please try again.', {
          id: 'login-auth-error',
        });
      } else if (error.response) {
        // Other HTTP errors
        const message = error.response?.data?.message || 'Login failed. Please try again.';
        toast.error(message, {
          id: 'login-error',
        });
      } else {
        // Unknown error (but not network error)
        toast.error('Login failed. Please try again.', {
          id: 'login-error',
        });
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterRequest) => {
    try {
      setLoading(true);
      const newUser = await authService.register(userData);
      toast.success('Registration successful! Please login to continue.');
    } catch (error: any) {
      // Check if it's a network error (no response means network/server unavailable)
      // Network errors have no response object and may have specific error codes/messages
      const isNetworkError = !error.response && (
        error.code === 'ERR_NETWORK' || 
        error.code === 'ECONNREFUSED' ||
        error.message === 'Network Error' || 
        error.message?.includes('Network') ||
        error.message?.includes('Failed to fetch') ||
        error.message?.includes('timeout')
      );
      
      if (isNetworkError) {
        // Network error - backend not available
        toast.error('Cannot connect to server. Please make sure the backend is running.', {
          id: 'register-network-error',
          duration: 5000,
        });
        throw error;
      }
      
      // Handle HTTP response errors
      if (error.response?.status === 400 || error.response?.status === 409) {
        // Bad request or conflict (e.g., email already exists)
        const message = error.response?.data?.message || 'Registration failed. Please check your information.';
        toast.error(message, {
          id: 'register-validation-error',
        });
      } else if (error.response) {
        // Other HTTP errors
        const message = error.response?.data?.message || 'Registration failed. Please try again.';
        toast.error(message, {
          id: 'register-error',
        });
      } else {
        // Unknown error (but not network error)
        toast.error('Registration failed. Please try again.', {
          id: 'register-error',
        });
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      authService.removeStoredUser();
      toast.success('Logged out successfully!');
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    authService.storeUser(updatedUser);
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
