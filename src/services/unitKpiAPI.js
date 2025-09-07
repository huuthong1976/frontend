// src/services/unitKpiAPI.js
import apiClient from './apiClient'; // Import axios instance đã được cấu hình

// --- CÁC HÀM CHO NGHIỆP VỤ "THƯ VIỆN KPI" ---

/**
 * Lấy danh sách KPI gốc từ thư viện dưới dạng cây.
 * @returns {Promise<Array>} Dữ liệu cây KPI.
 */
export const getKpiLibraryTree = async () => {
    const response = await apiClient.get('/kpi-library');
    return response.data;
};


// --- CÁC HÀM CHO NGHIỆP VỤ "ĐĂNG KÝ KPI ĐƠN VỊ" ---

/**
 * Lấy danh sách các KPI đã được một đơn vị đăng ký trong một năm.
 * @param {number} companyId - ID của công ty.
 * @param {number} year - Năm cần xem.
 * @returns {Promise<Array>} Danh sách KPI đã đăng ký.
 */
export const getUnitRegistrations = async ({ companyId, year }) => {
    const response = await apiClient.get(`/unit-kpi/${companyId}/${year}`);
    return response.data;
};

/**
 * Lưu lại toàn bộ danh sách KPI đã đăng ký cho một đơn vị.
 * @param {object} payload - Dữ liệu chứa { companyId, year, kpiItems }.
 * @returns {Promise<object>} - Kết quả từ server.
 */
export const saveUnitRegistrations = async (payload) => {
    const response = await apiClient.post('/unit-kpi', payload);
    return response.data;
};


// --- CÁC HÀM CHO NGHIỆP VỤ "NHẬP KẾT QUẢ KPI ĐƠN VỊ" ---

/**
 * Lấy danh sách KPI đã đăng ký và kết quả thực tế trong một tháng cụ thể.
 * @param {object} params - Dữ liệu chứa { companyId, year, month }.
 * @returns {Promise<Array>} Danh sách KPI và kết quả tháng.
 */
export const getUnitKpiResults = async ({ companyId, year, month }) => {
    const response = await apiClient.get(`/unit-kpi-result/${companyId}/${year}/${month}`);
    return response.data;
};

/**
 * Lưu lại toàn bộ kết quả thực tế của các KPI trong một tháng.
 * @param {Array<object>} resultsData - Mảng các đối tượng kết quả.
 * @returns {Promise<object>} - Kết quả từ server.
 */
export const saveUnitKpiResults = async (resultsData) => {
    const response = await apiClient.post('/unit-kpi-result', resultsData);
    return response.data;
};