// src/api.js
import axios from 'axios';

// Ví dụ: REACT_APP_API_BASE_URL = https://backend-xxx.up.railway.app/api
const API_BASE =
  (process.env.REACT_APP_API_BASE_URL || '/api').replace(/\/$/, '');

// Login path mặc định cho HashRouter trên GitHub Pages
// Có thể override: REACT_APP_LOGIN_PATH='/#/login'
const LOGIN_PATH = process.env.REACT_APP_LOGIN_PATH || '/#/login';

// Cho phép override endpoint nếu backend khác path mặc định
const COMPANIES_EP   = process.env.REACT_APP_COMPANY_ENDPOINT     || '/companies';
const KPI_ASPECTS_EP = process.env.REACT_APP_KPI_ASPECTS_ENDPOINT || '/kpi-aspects';

export const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
});

function getToken() {
  return localStorage.getItem('token') || sessionStorage.getItem('token');
}

// Gắn Bearer token cho mọi request
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Tự xử lý khi 401: xoá token + redirect về trang đăng nhập
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      const base = (process.env.PUBLIC_URL || '').replace(/\/$/, '');
      window.location.replace(`${base}${LOGIN_PATH}`);
    }
    return Promise.reject(error);
  }
);

// ===== API wrappers =====
export const getCompanies  = () => api.get(COMPANIES_EP); // hoặc /companies/summary nếu bạn override
export const getKpiAspects = () => api.get(KPI_ASPECTS_EP);
export const getKpiTree    = (companyId) =>
  api.get('/kpi-library/tree', { params: { company_id: companyId } });

export default api;
