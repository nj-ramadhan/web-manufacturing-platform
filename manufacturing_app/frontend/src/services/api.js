import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (data) => api.post('/auth/register/', data),
  login: (data) => api.post('/auth/login/', data),
  logout: () => api.post('/auth/logout/'),
  getProfile: () => api.get('/auth/me/'),
  updateProfile: (data) => api.patch('/auth/profile/', data),
};

// File Upload APIs
export const fileAPI = {
  upload: (formData) =>
    api.post('/files/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getAll: () => api.get('/files/'),
  getById: (id) => api.get(`/files/${id}/`),
  
  generateQuote: (id, data) =>
    api.post(`/files/${id}/generate_quote/`, data, {
      headers: {
        'Content-Type': 'application/json',
      },
    }),
};

// Quote APIs
export const quoteAPI = {
  getAll: () => api.get('/quotes/'),
  getById: (id) => api.get(`/quotes/${id}/`),
  accept: (id) => api.post(`/quotes/${id}/accept/`),
  reject: (id) => api.post(`/quotes/${id}/reject/`),
};

export const orderAPI = {
  getAll: (params = {}) => api.get('/orders/', { params }),
  getById: (id) => api.get(`/orders/${id}/`),
  myOrders: () => api.get('/orders/my_orders/'),
  updateStatus: (id, data) => api.post(`/orders/${id}/update_status/`, data),
  addStageUpdate: (id, data) => api.post(`/orders/${id}/add_stage_update/`, data),
  addUpdate: (id, data) => api.post(`/orders/${id}/add_update/`, data),
};

// Guest quote endpoint (no auth)
export const guestQuoteAPI = {
  submit: (data) => {
    // Create separate axios instance without auth interceptor for public endpoints
    const publicApi = axios.create({
      baseURL: 'http://localhost:8000/api',
      headers: { 'Content-Type': 'application/json' },
    });
    return publicApi.post('/guest-quotes/', data);
  },
};

export default api;