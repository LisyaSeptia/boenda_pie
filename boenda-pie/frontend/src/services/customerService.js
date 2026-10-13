import api from './api';

export const customerService = {
  getAll: async (params = {}) => {
    const response = await api.get('/customers', { params });
    return response.data;
  },
  createOrGet: async (data) => {
    const response = await api.post('/customers', data);
    return response.data;
  }
};
