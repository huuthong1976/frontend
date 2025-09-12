// src/services/apiClient.js
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api', // chỉnh lại nếu backend đổi port/path
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor -> gắn token vào mọi request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
// Response interceptor -> xử lý lỗi chung
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response) {
        const { status } = error.response;
  
        if (status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        } else if (status === 403) {
          console.error("🚫 Bạn không có quyền truy cập API này.");
        } else if (status === 404) {
          console.error("🚫 API không tìm thấy.");
        } else if (status === 500) {
          console.error("🚫 Lỗi server. Vui lòng thử lại sau.");
        }
      }
      return Promise.reject(error);
    }
  );

  
export default apiClient;
