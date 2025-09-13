// src/services/employeeAPI.js
import apiClient from './apiClient';

// Lấy danh sách nhân viên có phân trang và lọc
export const getEmployees = (params) => {
    if (!params.companyId) {
      return Promise.reject(new Error("Thiếu tham số companyId"));
    }
    return apiClient.get('/api/employees', { params });
  };
// Lấy danh sách rút gọn cho dropdown
export const getEmployeeSelectList = (params) => {
    return apiClient.get('/api/employees/select-list', { params });
};

// Lấy chi tiết một nhân viên
export const getEmployeeById = (id) => {
    return apiClient.get(`/api/employees/${id}`);
};

// Tạo mới nhân viên
export const createEmployee = (employeeData) => {
    return apiClient.post('/api/employees', employeeData);
};

// Cập nhật nhân viên
export const updateEmployee = (id, employeeData) => {
    return apiClient.put(`/api/employees/${id}`, employeeData);
};

// Xóa (mềm) nhân viên
export const deleteEmployee = (id) => {
    return apiClient.delete(`/api/employees/${id}`);
};
