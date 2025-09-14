// src/services/kpiLibraryAPI.js
import apiClient from './apiClient';

export const getTree = (filters = {}) => {
    // Tạo một đối tượng URLSearchParams để xây dựng query string
    const params = new URLSearchParams();

    // Thêm các tham số vào nếu chúng tồn tại
    if (filters.companyId) {
        params.append('companyId', filters.companyId);
    }
    if (filters.aspectId) {
        params.append('aspectId', filters.aspectId);
    }

    const queryString = params.toString();

    // Nối query string vào URL, thêm dấu '?' nếu cần
    return apiClient.get(`/kpi-library${queryString ? `?${queryString}` : ''}`);
};

export const createKpi = (kpiData) => {
    return apiClient.post('/kpi-library', kpiData);
};

export const updateKpi = (id, kpiData) => {
    return apiClient.put(`/kpi-library/${id}`, kpiData);
};

export const deleteKpi = (id) => {
    return apiClient.delete(`/kpi-library/${id}`);
};