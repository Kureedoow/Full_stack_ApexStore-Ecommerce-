import api from './axios';

export const reviewApi = {
  getProductReviews: (productId, params = {}) => api.get(`/products/${productId}/reviews`, { params }),
  createProductReview: (productId, reviewData) => api.post(`/products/${productId}/reviews`, reviewData),
  updateReview: (id, reviewData) => api.put(`/reviews/${id}`, reviewData),
  deleteReview: (id) => api.delete(`/reviews/${id}`),
};

export default reviewApi;
