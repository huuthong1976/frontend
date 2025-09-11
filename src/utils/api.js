// src/utils/api.js (ĐÃ SỬA)
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
  withCredentials: true,
});

function getToken() {
  return (
    localStorage.getItem('token') ||
    sessionStorage.getItem('token')
  );
}

// Request Interceptor: Tự động GỬI token đi
api.interceptors.request.use(
  (config) => {
    // SỬA LẠI: Gọi hàm getToken() để lấy token từ cả hai nơi
    const token = getToken(); 
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor để xử lý lỗi 401 (ĐÃ RẤT TỐT)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      sessionStorage.removeItem('token'); // Nên xóa ở cả hai nơi
      window.location.href = '/login'; 
    }
    return Promise.reject(error);
  }
);

export default api;