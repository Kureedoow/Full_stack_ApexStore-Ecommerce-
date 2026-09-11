import api from './axios';

export const orderApi = {
  createOrder: (orderData) => api.post('/orders', orderData),
  getMyOrders: (params = {}) => api.get('/orders', { params }),
  getOrderById: (id) => api.get(`/orders/${id}`),
  cancelOrder: (id, reason = '') => api.patch(`/orders/${id}/cancel`, { reason }),
};

export default orderApi;
