import axios from 'axios';

const publicAPI = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Add authentication interceptor for user tokens
publicAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('userToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

publicAPI.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('userToken');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const categoryAPI = {
  getAll: () => publicAPI.get('/categories'),
  getById: (id) => publicAPI.get(`/categories/${id}`),
};

export const subcategoryAPI = {
  getByCategory: (categoryId) => publicAPI.get(`/categories/category/${categoryId}`),
  getAll: () => publicAPI.get('/subcategories'), // if needed
};

export const machinesAPI = {
  getAll: () => publicAPI.get('/machines'),
  getById: (id) => publicAPI.get(`/machines/${id}`),
  getFeatured: (params) => publicAPI.get('/machines', { params }),
};

export const videosAPI = {
  getAll: () => publicAPI.get('/videos'),
  getById: (id) => publicAPI.get(`/videos/${id}`),
  getAllPublic: () => publicAPI.get('/videos/all-public'), // <-- new method
};

export const contactAPI = {
  submit: (formData) => publicAPI.post('/contact', formData),
  // Admin endpoints (require auth, for admin dashboard)
  getAll: () => publicAPI.get('/contact'),
  markRead: (id) => publicAPI.patch(`/contact/${id}/read`),
  delete: (id) => publicAPI.delete(`/contact/${id}`),
};

export const partnerAPI = {
  getAll: () => publicAPI.get('/partners'),
};

export const successStoryAPI = {
  getAll: () => publicAPI.get('/success-stories'),
  create: (storyData) => publicAPI.post('/success-stories', storyData),
  submitUserStory: (storyData) => publicAPI.post('/success-stories/user-submit', storyData),
  uploadImage: (imageBase64) => publicAPI.post('/success-stories/upload-image', { image_base64: imageBase64 }),
  getUserStories: () => publicAPI.get('/success-stories/user-stories'),
};

export const aboutAPI = {
  get: () => publicAPI.get('/about'),
};

export const settingsAPI = {
  getAll: () => publicAPI.get('/settings'),
  getByPage: (page) => publicAPI.get(`/settings/${page}`),
};

export const subscriptionAPI = {
  subscribe: (data) => publicAPI.post('/subscriptions/subscribe', data),
  unsubscribe: (data) => publicAPI.post('/subscriptions/unsubscribe', data),
};

export const userAPI = {
  register: (userData) => publicAPI.post('/users/register', userData),
  login: (credentials) => publicAPI.post('/users/login', credentials),
  getProfile: () => publicAPI.get('/users/profile'),
  updateProfile: (profileData) => publicAPI.put('/users/profile', profileData),
  uploadProfileImage: (imageBase64) => publicAPI.post('/users/profile/image', { image_base64: imageBase64 }),
  getCart: () => publicAPI.get('/users/cart'),
  addToCart: (machineId, quantity) => publicAPI.post('/users/cart/add', { machine_id: machineId, quantity }),
  updateCartItem: (itemId, quantity) => publicAPI.put(`/users/cart/update/${itemId}`, { quantity }),
  removeFromCart: (itemId) => publicAPI.delete(`/users/cart/remove/${itemId}`),
  clearCart: () => publicAPI.delete('/users/cart/clear'),
};

export const feedbackAPI = {
  getAll: () => publicAPI.get('/feedback'),
  submit: (feedbackData) => publicAPI.post('/feedback', feedbackData),
  uploadImage: (imageBase64) => publicAPI.post('/feedback/upload-image', { image_base64: imageBase64 }),
  like: (feedbackId) => publicAPI.post(`/feedback/${feedbackId}/like`),
  dislike: (feedbackId) => publicAPI.post(`/feedback/${feedbackId}/dislike`),
  reply: (feedbackId, message) => publicAPI.post(`/feedback/${feedbackId}/reply`, { message }),
  likeReply: (feedbackId, replyId) => publicAPI.post(`/feedback/${feedbackId}/replies/${replyId}/like`),
  dislikeReply: (feedbackId, replyId) => publicAPI.post(`/feedback/${feedbackId}/replies/${replyId}/dislike`),
};
