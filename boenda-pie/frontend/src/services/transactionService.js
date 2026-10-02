import api from './api';

export const transactionService = {
  create: async (data) => {
    const response = await api.post('/transactions', data);
    return response.data;
  },
  getAll: async (params = {}) => {
    const response = await api.get('/transactions', { params });
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/transactions/${id}`);
    return response.data;
  }
};
