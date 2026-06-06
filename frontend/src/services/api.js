import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (username, password) => {
    const response = await api.post('/api/auth/login', { username, password });
    if (response.data && response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },
  register: async (username, password) => {
    const response = await api.post('/api/auth/register', { username, password });
    return response.data;
  },
  getMe: async () => {
    const response = await api.get('/api/auth/me');
    return response.data;
  },
  logout: () => {
    localStorage.removeItem('token');
    window.location.reload();
  },
};

export const emailService = {
  getEmails: async (folder = 'Inbox') => {
    const response = await api.get(`/api/emails`, { params: { folder } });
    return response.data;
  },
  getEmail: async (id) => {
    const response = await api.get(`/api/emails/${id}`);
    return response.data;
  },
  sendEmail: async (to, subject, body) => {
    const response = await api.post(`/api/emails`, { to, subject, body });
    return response.data;
  },
  markAsRead: async (id, folder) => {
    const response = await api.put(`/api/emails/${id}/read`, null, { params: { folder } });
    return response.data;
  },
  deleteEmails: async (folder, emailIds) => {
    const response = await api.delete(`/api/emails`, { data: { folder, emailIds } });
    return response.data;
  },
  copyEmails: async (sourceFolder, targetFolder, emailIds) => {
    const response = await api.post(`/api/emails/copy`, { sourceFolder, targetFolder, emailIds });
    return response.data;
  },
};

export const folderService = {
  getFolders: async () => {
    const response = await api.get('/api/folders');
    return response.data;
  },
  addFolder: async (label, color) => {
    const response = await api.post('/api/folders', { label, color });
    return response.data;
  },
  getStats: async () => {
    const response = await api.get('/api/stats');
    return response.data;
  },
};

export default api;
