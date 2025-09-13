// src/services/dashboardAPI.js
import apiClient from './apiClient'; // Import axios instance đã được cấu hình
/**
 * Lấy dữ liệu tổng hợp cho trang Dashboard từ server.
 * @param {object} filters - Đối tượng chứa các bộ lọc (ví dụ: { companyId: 1 }).
 * @returns {Promise<object>} - Dữ liệu tổng hợp.
 */
export const getDashboardSummary = async (filters) => {
    try {
        const response = await apiClient.get('/api/dashboard/summary', { params: filters });
        return response.data; // Trả về trực tiếp phần data của response
    } catch (error) {
        // Ghi lại lỗi và throw lại để hook có thể bắt được
        console.error("API Error fetching dashboard summary:", error);
        throw error;
    }
};
