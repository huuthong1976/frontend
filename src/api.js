// src/utils/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || '/api',
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
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ CHUYÊN GIA BỔ SUNG: Response Interceptor để xử lý lỗi 401
// Tự động XỬ LÝ khi token hết hạn
api.interceptors.response.use(
  (response) => response, // Nếu response thành công, trả về nó
  (error) => {
    // Nếu lỗi là 401 (Unauthorized)
    if (error.response && error.response.status === 401) {
      // Xóa token cũ, không hợp lệ
      localStorage.removeItem('token');
      // Chuyển hướng người dùng về trang đăng nhập
      // Dùng window.location thay vì navigate vì chúng ta đang ở ngoài phạm vi của React Router
      window.location.href = '/login'; 
      // Có thể thêm thông báo cho người dùng
      // alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
    }
    // Trả về lỗi để các component khác có thể bắt và xử lý nếu cần
    return Promise.reject(error);
  }
);

export default api;