// src/services/apiService.js

import axios from 'axios';


const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api', 
  headers: {
    'Content-Type': 'application/json',
  },
});


apiClient.interceptors.request.use(
  (config) => {
    // Lấy token từ localStorage (hoặc nơi bạn lưu trữ sau khi đăng nhập)
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




/**
 * Lấy danh sách Công ty từ server
 * @returns {Promise<Array>}
 */
const getCompanies = async () => {
  try {
    const response = await apiClient.get('/companies');
    return response.data;
  } catch (error) {
    console.error('Lỗi khi lấy danh sách công ty:', error);
    return []; // Luôn trả về mảng rỗng khi có lỗi
  }
};

/**
 * Lấy danh sách Phòng ban từ server
 * @returns {Promise<Array>}
 */
const getDepartments = async () => {
  try {
    const response = await apiClient.get('/departments');
    return response.data;
  } catch (error) {
    console.error('Lỗi khi lấy danh sách phòng ban:', error);
    return [];
  }
};

/**
 * Lấy danh sách Chức vụ từ server
 * @returns {Promise<Array>}
 */
const getPositions = async () => {
  try {
    const response = await apiClient.get('/positions');
    return response.data;
  } catch (error) {
    console.error('Lỗi khi lấy danh sách chức vụ:', error);
    return [];
  }
};
/**
 * Gửi dữ liệu để tạo người dùng mới
 * @param {object} userData Dữ liệu người dùng từ form
 * @returns {Promise<object>}
 */
const createUser = async (userData) => {
   
    try {
      const response = await apiClient.post('/users', userData);
      return response.data;
    } catch (error) {
      // Ném lỗi ra ngoài để component có thể bắt và hiển thị thông báo
      throw error;
    }
  };
  
// --- XUẤT RA ĐỂ SỬ DỤNG ---
// Gom tất cả các hàm vào một đối tượng duy nhất để dễ dàng import và sử dụng.
export const apiService = {
  getCompanies,
  getDepartments,
  getPositions,
  createUser,
  // ...thêm các hàm gọi API khác của bạn vào đây
};