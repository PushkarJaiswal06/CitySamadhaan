import api from './api';

export const authService = {
  // Register new user
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // Login with password
  login: async (phone, password, authMethod = 'password') => {
    const response = await api.post('/auth/login', { phone, password, authMethod });
    return response.data;
  },

  // Login with OTP
  loginWithOTP: async (phone) => {
    const response = await api.post('/auth/login', { phone, authMethod: 'otp' });
    return response.data;
  },

  // Verify OTP
  verifyOTP: async (phone, otp) => {
    const response = await api.post('/auth/verify-otp', { phone, otp });
    return response.data;
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Logout
  logout: async () => {
    const response = await api.post('/auth/logout');
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    return response.data;
  }
};
