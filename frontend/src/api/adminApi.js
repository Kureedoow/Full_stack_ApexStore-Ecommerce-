import api from './axios';

export const adminApi = {
  getDashboard: () => api.get('/admin/dashboard'),
  getStatistics: (params = {}) => api.get('/admin/statistics', { params }),
  getUsers: (params = {}) => api.get('/admin/users', { params }),
  getUserById: (id) => api.get(`/admin/users/${id}`),
  updateUserRole: (id, role) => api.patch(`/admin/users/${id}/role`, { role }),
  updateUserStatus: (id, isActive) => api.patch(`/admin/users/${id}/status`, { isActive }),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getOrders: (params = {}) => api.get('/admin/orders', { params }),
  updateOrderStatus: (id, orderStatus) => api.patch(`/admin/orders/${id}/status`, { orderStatus }),
  getProducts: (params = {}) => api.get('/admin/products', { params }),
};

export default adminApi;
