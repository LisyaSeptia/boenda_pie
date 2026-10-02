import api from './api';

export const stockService = {
  getMovements: async (params = {}) => {
    const response = await api.get('/stock/movements', { params });
    return response.data;
  },
  getSummary: async () => {
    const response = await api.get('/stock/summary');
    return response.data;
  },
  adjust: async (data) => {
    const response = await api.post('/stock/adjust', data);
    return response.data;
  }
};
