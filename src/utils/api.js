import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000', 
  withCredentials: false,
 
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && !config.url.includes('/auth/login')) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
export const apiClient = api; // nếu code cũ còn import apiClient

