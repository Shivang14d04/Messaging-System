import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authService = {
  getMe: async () => {
    const response = await api.get('/api/auth/me');
    return response.data;
  },
  logout: () => {

    window.location.href = `${API_BASE_URL}/logout`;
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
};

export const folderService = {
  getFolders: async () => {
    const response = await api.get('/api/folders');
    return response.data;
  },
  getStats: async () => {
    const response = await api.get('/api/stats');
    return response.data;
  },
};

export default api;
