// src/services/kpiAPI.js
import axios from 'axios'; // Sử dụng axios để dễ dàng gửi token hơn

// Thiết lập base URL cho axios
const api = axios.create({
    baseURL: 'http://localhost:5000/api', // Hoặc địa chỉ server của bạn
});

// Interceptor để tự động đính kèm token vào mỗi request
api.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

// Hàm xử lý response chung cho axios
const handleResponse = (response) => response.data;

// ✅ SỬA ĐỔI: Đổi tên hàm cho khớp với yêu cầu từ hook
export const getKpiPlanDetails = (userId, month, year) => {
    return api.get(`/kpi/plan/${userId}/${month}/${year}`).then(handleResponse);
};

// Hàm fetchCurrentUser vẫn giữ nguyên nếu bạn cần dùng ở nơi khác
export const fetchCurrentUser = () => {
    return api.get('/auth/me').then(handleResponse);
};

// ✅ SỬA ĐỔI: Đổi tên hàm cho khớp với yêu cầu từ hook
export const saveKpiPlan = (planData) => {
    // Sử dụng PUT hoặc POST tùy vào thiết kế API của bạn
    // PUT thường dùng để cập nhật toàn bộ resource, POST có thể dùng để tạo mới hoặc cập nhật
    return api.put(`/kpi/plan/update`, planData).then(handleResponse);
};

// ✅ BỔ SUNG: Thêm hàm còn thiếu
export const submitKpiPlanForReview = (planId) => {
    // Đây là một ví dụ, bạn cần thay đổi endpoint `/kpi/plan/submit` cho đúng với API backend
    // Thường hành động này sẽ là một lệnh POST hoặc PUT tới một ID cụ thể
    return api.post(`/kpi/plan/submit/${planId}`).then(handleResponse);
};
