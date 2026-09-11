import api from './axios';

export const couponApi = {
  validateCoupon: (code, orderAmount) => api.post('/coupons/validate', { code, orderAmount }),
  getCoupons: (params = {}) => api.get('/coupons', { params }),
  createCoupon: (couponData) => api.post('/coupons', couponData),
  updateCoupon: (id, couponData) => api.put(`/coupons/${id}`, couponData),
  deleteCoupon: (id) => api.delete(`/coupons/${id}`),
};

export default couponApi;
