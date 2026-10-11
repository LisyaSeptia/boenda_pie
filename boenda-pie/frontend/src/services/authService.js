import api from './api';

export const authService = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
  updateProfile: async (data) => {
    const response = await api.put('/auth/profile', data);
    return response.data;
  },
  updatePassword: async (data) => {
    const response = await api.put('/auth/change-password', data);
    return response.data;
  }
};
