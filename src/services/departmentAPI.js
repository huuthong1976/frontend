// src/services/departmentAPI.js
import apiClient from './apiClient'; // Import axios instance đã cấu hình

export const getDepartments = (params) => {
    return apiClient.get('/api/departments', { params });
};

export const createDepartment = (departmentData) => {
    return apiClient.post('/api/departments', departmentData);
};

export const updateDepartment = (id, departmentData) => {
    return apiClient.put(`/api/departments/${id}`, departmentData);
};

export const deleteDepartment = (id) => {
    return apiClient.delete(`/api/departments/${id}`);
};
export const getDepartmentById = (id) => {
    return apiClient.get(`/api/departments/${id}`);
  };
