import api from './api';

export const reportService = {
  getDashboardData: async () => {
    const response = await api.get('/reports/dashboard');
    return response.data;
  },
  getSalesReport: async (params = {}) => {
    const response = await api.get('/reports/sales', { params });
    return response.data;
  }
};
