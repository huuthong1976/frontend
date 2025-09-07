// src/services/axios.config.js
import axios from 'axios';

// Tạo một instance của axios
const axiosInstance = axios.create({
  // Đặt URL cơ sở cho tất cả các request API
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Cấu hình interceptor để tự động đính kèm token vào mỗi request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // Lấy token từ localStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Export instance đã được cấu hình để sử dụng ở những nơi khác
export default axiosInstance;