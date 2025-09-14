// src/services/departmentAPI.js
import apiClient from './apiClient'; // Import axios instance đã cấu hình


export const getDepartments = (params) => {
    return apiClient.get('/departments', { params });
};

export const createDepartment = (departmentData) => {
    return apiClient.post('/departments', departmentData);
};

export const updateDepartment = (id, departmentData) => {
    return apiClient.put(`/departments/${id}`, departmentData);
};

export const deleteDepartment = (id) => {
    return apiClient.delete(`/departments/${id}`);
};
export const getDepartmentById = (id) => {
    return apiClient.get(`/departments/${id}`);
  };