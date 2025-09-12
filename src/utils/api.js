// src/utils/api.js
import axios from 'axios';

const API_BASE =
  process.env.REACT_APP_API_BASE_URL ||
  'https://backend-production-bc73.up.railway.app';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: false,
});

function getToken() {
  return localStorage.getItem('token') || sessionStorage.getItem('token');
}


api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  // tránh cache trên GitHub Pages
  config.headers['Cache-Control'] = 'no-store';
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
