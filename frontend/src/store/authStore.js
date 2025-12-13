import { create } from 'zustand';
import { authService } from '../services/authService';

export const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null,

  setUser: (user) => set({ user, isAuthenticated: true }),

  login: async (credentials) => {
    set({ loading: true, error: null });
    try {
      const { phone, password, authMethod } = credentials;
      let data;
      
      if (authMethod === 'otp') {
        data = await authService.loginWithOTP(phone);
      } else {
        const { data: responseData } = await authService.login(phone, password, authMethod);
        data = responseData;
      }
      
      // Only store tokens if we have them (not for OTP requests)
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('refreshToken', data.refreshToken);
        set({ 
          user: data.user, 
          token: data.token,
          isAuthenticated: true,
          loading: false
        });
      } else {
        set({ loading: false });
      }
      
      return { data };
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Login failed',
        loading: false
      });
      throw error;
    }
  },

  loginWithOTP: async (phone) => {
    set({ loading: true, error: null });
    try {
      const data = await authService.loginWithOTP(phone);
      set({ loading: false });
      return data;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to send OTP',
        loading: false
      });
      throw error;
    }
  },

  verifyOTP: async (phone, otp) => {
    set({ loading: true, error: null });
    try {
      const { data } = await authService.verifyOTP(phone, otp);
      localStorage.setItem('token', data.token);
      localStorage.setItem('refreshToken', data.refreshToken);
      set({ 
        user: data.user, 
        token: data.token,
        isAuthenticated: true,
        loading: false
      });
      return data;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Invalid OTP',
        loading: false
      });
      throw error;
    }
  },

  register: async (userData) => {
    set({ loading: true, error: null });
    try {
      const data = await authService.register(userData);
      set({ loading: false });
      return data;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Registration failed',
        loading: false
      });
      throw error;
    }
  },

  logout: async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      set({ 
        user: null, 
        token: null,
        isAuthenticated: false
      });
    }
  },

  fetchUser: async () => {
    if (!localStorage.getItem('token')) return;
    
    set({ loading: true });
    try {
      const { data } = await authService.getCurrentUser();
      set({ user: data, isAuthenticated: true, loading: false });
    } catch (error) {
      set({ 
        user: null,
        isAuthenticated: false,
        loading: false
      });
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    }
  }
}));
