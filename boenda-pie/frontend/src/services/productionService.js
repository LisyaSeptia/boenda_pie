import api from './api';

export const productionService = {
  getAll: async () => {
    const response = await api.get('/productions');
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/productions/${id}`);
    return response.data;
  },
  create: async (data) => {
    const response = await api.post('/productions', data);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/productions/${id}`);
    return response.data;
  }
};
