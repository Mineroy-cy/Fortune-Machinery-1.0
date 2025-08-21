import axios from 'axios';

const adminAPI = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  // ⚠️ DO NOT set Content-Type globally here
});

adminAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

adminAPI.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('adminToken');
      window.location.href = '/admin/login';
    }
    return Promise.reject(err);
  }
);

// ✅ Auth API
export const authAPI = {
  login: (credentials) => adminAPI.post('/auth/login', credentials),
  verify: () => adminAPI.get('/auth/verify'),
  logout: () => adminAPI.post('/auth/logout'),
};

// ✅ Admin Stats
export const statsAPI = {
  getStats: () => adminAPI.get('/admin/stats'),
};

// ✅ Categories
export const categoriesAPI = {
  getAll: () => adminAPI.get('/categories'),
  getById: (id) => adminAPI.get(`/categories/${id}`),
  create: (payload) => adminAPI.post('/categories', payload, {
    headers: { 'Content-Type': 'application/json' },
  }),
  update: (id, data) => adminAPI.put(`/categories/${id}`, data, {
    headers: { 'Content-Type': 'application/json' },
  }),
  remove: (id) => adminAPI.delete(`/categories/${id}`),
  uploadImage: (base64Image) =>
  adminAPI.post('/categories/upload/category-image', { image_base64: base64Image })

};

// ✅ Subcategories
export const subcategoriesAPI = {
  getSubcategories: (categoryId) =>
    adminAPI.get(`/categories/${categoryId}/subcategories?ts=${Date.now()}`),
  createSubcategory: (categoryId, data) =>
    adminAPI.post(`/categories/${categoryId}/subcategories`, data),
  updateSubcategory: (categoryId, subId, data) =>
    adminAPI.put(`/categories/${categoryId}/subcategories/${subId}`, data),
  removeSubcategory: (categoryId, subId) =>
    adminAPI.delete(`/categories/${categoryId}/subcategories/${subId}`),
 uploadSubcategoryImage: (base64Image) =>
  adminAPI.post(`/categories/upload-subcategory-image`, { image_base64: base64Image }),
getByCategory: (categoryId) => adminAPI.get(`/categories/${categoryId}/subcategories`),
};

// ✅ Machines (FormData is used — headers are auto-set)
export const machinesAPI = {
  getAll: () => adminAPI.get('/machines'),
  getById: (id) => adminAPI.get(`/machines/${id}`),
  create: (payload) => adminAPI.post('/machines', payload), // Do not set headers
  update: (id, payload) => adminAPI.put(`/machines/${id}`, payload), // Do not set headers
  remove: (id) => adminAPI.delete(`/machines/${id}`),
};

export const mediaAPI = {
  post: (url, payload) => adminAPI.post(url, payload), // ✅ Reuse adminAPI
};

export const partnerAPI = {
  getAll: () => adminAPI.get('/partners'),
  create: (payload) => adminAPI.post('/partners', payload),
  update: (id, payload) => adminAPI.put(`/partners/${id}`, payload),
  remove: (id) => adminAPI.delete(`/partners/${id}`),
};

export const feedbackAPI = {
  getAll: () => adminAPI.get('/feedback/all'),
  approve: (id) => adminAPI.patch(`/feedback/${id}/approve`),
  disapprove: (id) => adminAPI.patch(`/feedback/${id}/disapprove`),
  delete: (id) => adminAPI.delete(`/feedback/${id}`),
};

export const successStoryAPI = {
  getAll: () => adminAPI.get('/success-stories/all'),
  create: (storyData) => adminAPI.post('/success-stories', storyData),
  update: (id, storyData) => adminAPI.put(`/success-stories/${id}`, storyData),
  delete: (id) => adminAPI.delete(`/success-stories/${id}`),
  approve: (id) => adminAPI.patch(`/success-stories/${id}/approve`),
  disapprove: (id) => adminAPI.patch(`/success-stories/${id}/disapprove`),
  uploadImage: (imageBase64) => adminAPI.post('/success-stories/upload-image', { image_base64: imageBase64 }),
};

export const aboutAPI = {
  get: () => adminAPI.get('/about'),
  create: (payload) => adminAPI.post('/about', payload),
  update: (id, payload) => adminAPI.put(`/about/${id}`, payload),
  remove: (id) => adminAPI.delete(`/about/${id}`),
};

export const contactAPI = {
  getAll: () => adminAPI.get('/contact'),
  markRead: (id) => adminAPI.patch(`/contact/${id}/read`),
  delete: (id) => adminAPI.delete(`/contact/${id}`),
};

export const settingsAPI = {
  getAll: () => adminAPI.get('/settings'),
  getByPage: (page) => adminAPI.get(`/settings/${page}`),
  create: (payload) => adminAPI.post('/settings', payload),
  update: (page, payload) => adminAPI.put(`/settings/${page}`, payload),
  remove: (page) => adminAPI.delete(`/settings/${page}`),
  uploadBackground: (imageBase64, page) => 
    adminAPI.post('/settings/upload-background', { image_base64: imageBase64, page }),
};

export const videosAPI = {
  getAll: () => adminAPI.get('/videos'),
  create: (payload) => adminAPI.post('/videos', payload),
  update: (id, payload) => adminAPI.put(`/videos/${id}`, payload),
  remove: (id) => adminAPI.delete(`/videos/${id}`),
  toggleFeatured: (id) => adminAPI.patch(`/videos/${id}/featured`),
  toggleHighlighted: (id) => adminAPI.patch(`/videos/${id}/highlighted`),
};

export const subscriptionAPI = {
  getAll: () => adminAPI.get('/subscriptions'),
  getStats: () => adminAPI.get('/subscriptions/stats'),
  remove: (id) => adminAPI.delete(`/subscriptions/${id}`),
};
