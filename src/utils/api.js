// src/utils/api.js
import axios from 'axios';

// Đọc biến môi trường cho CRA
const rawApiHost =
  (typeof process !== 'undefined' ? process.env.REACT_APP_API_BASE_URL : '') ||
  'https://backend-production-bc73.up.railway.app';

const API_HOST = String(rawApiHost).replace(/\/$/, ''); // bỏ "/" cuối

// Base path khi host trên GitHub Pages (ví dụ: /frontend)
const rawBasePath =
  (typeof process !== 'undefined' ? process.env.PUBLIC_URL : '') || '';
const BASE_PATH = String(rawBasePath).replace(/\/$/, ''); // '' hoặc '/frontend'

// Helpers
function getToken() {
  return localStorage.getItem('token') || sessionStorage.getItem('token');
}

function redirectToLogin() {
  // App đang dùng HashRouter
  window.location.replace(`${BASE_PATH}/#/login`);
}

// Axios instance
const api = axios.create({
  baseURL: `${API_HOST}/api`, // các call kiểu api.get('/companies') -> gọi tới {API_HOST}/api/companies
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  withCredentials: false,
  timeout: 15000,
});

// Interceptors
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  config.headers['Cache-Control'] = 'no-store';
  config.headers.Pragma = 'no-cache';
  config.headers.Expires = '0';
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      redirectToLogin();
    }
    return Promise.reject(err);
  }
);

export default api;

