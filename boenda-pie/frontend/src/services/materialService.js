import api from './api';

export const materialService = {
  getAll: async (params = {}) => {
    const response = await api.get('/materials', { params });
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/materials/${id}`);
    return response.data;
  },
  create: async (data) => {
    const response = await api.post('/materials', data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/materials/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/materials/${id}`);
    return response.data;
  }
};
