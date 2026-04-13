import axios from 'axios';

// 🔥 IMPORTANT: NO /api here
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
});

// Attach token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ================= AUTH =================
export const authService = {
  login: (data) => api.post('/api/auth/login', data),
  register: (data) => api.post('/api/auth/register', data),
  getAvailableHostels: () => api.get('/api/auth/hostels'),
  getMe: () => api.get('/api/auth/me'),
  getStaff: () => api.get('/api/auth/staff'),

  updateProfile: (data) => {
    const formData = new FormData();

    Object.keys(data).forEach(key => {
      if (data[key] !== undefined && data[key] !== null && key !== 'profilePictureFile') {
        if ((key === 'password' || key === 'oldPassword') && data[key] === '') {
          // skip empty password
        } else {
          formData.append(key, data[key]);
        }
      }
    });

    if (data.profilePictureFile) {
      formData.append('profilePicture', data.profilePictureFile);
    }

    return api.put('/api/auth/profile', formData);
  },

  uploadProfilePicture: (file) => {
    const formData = new FormData();
    formData.append('profilePicture', file);
    return api.post('/api/auth/profile-picture', formData);
  },
};

// ================= COMPLAINTS =================
export const complaintService = {
  getAll: () => api.get('/api/complaints'),
  getById: (id) => api.get(`/api/complaints/${id}`),
  create: (data) => api.post('/api/complaints', data),
  updateStatus: (id, data) => api.put(`/api/complaints/${id}`, data),
};

// ================= ANALYTICS =================
export const analyticsService = {
  getAnalytics: () => api.get('/api/analytics'),
};

// ================= NOTIFICATIONS =================
export const notificationService = {
  getAll: () => api.get('/api/notifications'),
  markAsRead: (id) => api.put(`/api/notifications/${id}`),
  markAllAsRead: () => api.put('/api/notifications/read-all'),
};

export default api;