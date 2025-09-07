// src/services/companyAPI.js
import apiClient from './apiClient'; // Import axios instance đã cấu hình

/**
 * Lấy danh sách tất cả các công ty.
 */
export const getCompanyById = (id) => {
    return apiClient.get(`/companies/${id}`);
  };
export const getCompanies = async () => {
    const response = await apiClient.get('/companies');
    return response.data; // Trả về trực tiếp phần dữ liệu
};

/**
 * Lấy danh sách phòng ban, có hỗ trợ bộ lọc.
 */
export const getDepartments = async (params) => {
    const response = await apiClient.get('/departments', { params });
    return response.data; // Trả về trực tiếp phần dữ liệu
};


export const createCompany = (companyData) => {
    return apiClient.post('/companies', companyData);
};

export const updateCompany = (id, companyData) => {
    return apiClient.put(`/companies/${id}`, companyData);
};

export const deleteCompany = (id) => {
    return apiClient.delete(`/companies/${id}`);
};
