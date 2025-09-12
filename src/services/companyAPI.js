// src/services/companyAPI.js
import apiClient from './apiClient'; // Import axios instance đã cấu hình

/**
 * Lấy danh sách tất cả các công ty.
 */
export const getCompanyById = (id) => {
    return apiClient.get(`/api/companies/${id}`);
  };
export const getCompanies = async () => {
    const response = await apiClient.get('/api/companies');
    return response.data; // Trả về trực tiếp phần dữ liệu
};

/**
 * Lấy danh sách phòng ban, có hỗ trợ bộ lọc.
 */
export const getDepartments = async (params) => {
    const response = await apiClient.get('/api/departments', { params });
    return response.data; // Trả về trực tiếp phần dữ liệu
};


export const createCompany = (companyData) => {
    return apiClient.post('/api/companies', companyData);
};

export const updateCompany = (id, companyData) => {
    return apiClient.put(`/api/companies/${id}`, companyData);
};

export const deleteCompany = (id) => {
    return apiClient.delete(`/api/companies/${id}`);
};
