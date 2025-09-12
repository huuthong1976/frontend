// src/services/api.service.js

// Giữ 1 import axios duy nhất để dùng cho downloadFile và 1 số call đặc biệt
import axios from 'axios';

// Giữ nguyên các instance theo cấu trúc hiện có
import apiClient from './apiClient';          // axios instance chính
import axiosInstance from './axios.config';   // axios instance phụ (nếu có cấu hình riêng)
import api from '../utils/api';            // instance chuẩn Vite đã chuẩn hoá

// Lấy biến môi trường đúng chuẩn Vite
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

// ================== API chính ==================

// Đăng ký KPI đơn vị (GET danh sách)
export const getUnitKpiRegistrations = async (companyId, year) => {
  const response = await apiClient.get('/api/company-kpi', {
    params: { company_id: companyId, year }
  });
  return response.data;
};

// Công ty
export const getCompanies = async () => {
  const response = await apiClient.get('/api/companies');
  return response.data;
};

// Phòng ban
export const getDepartments = async (params) => {
  const response = await apiClient.get('/api/departments', { params });
  return response.data;
};

// Thư viện KPI (dropdown/filter)
export const getKpiLibrary = async (params) => {
  const response = await apiClient.get('/api/company-kpi/library', { params });
  return response.data;
};

// Tạo đăng ký KPI đơn vị
export const createUnitKpiRegistration = async (payload) => {
  const response = await apiClient.post('/api/company-kpi', payload);
  return response.data;
};

// Cập nhật đăng ký KPI đơn vị
export const updateUnitKpiRegistration = async (id, payload) => {
  const response = await apiClient.put(`/api/company-kpi/${id}`, payload);
  return response.data;
};

// Phân bổ KPI theo tháng
export const allocateKpiMonthlyTargets = async (registrationId, allocationData) => {
  const response = await apiClient.post(`/api/company-kpi/${registrationId}/allocate`, allocationData);
  return response.data;
};

// Tạo hàng loạt đăng ký KPI đơn vị
export const bulkCreateUnitKpiRegistrations = async (kpiList) => {
  const payload = { kpis: kpiList };
  const response = await apiClient.post('/api/company-kpi/bulk-register', payload);
  return response.data;
};

// Xoá đăng ký KPI đơn vị
export const deleteUnitKpiRegistration = async (id) => {
  return apiClient.delete(`/api/company-kpi/${id}`);
};

// Lấy kế hoạch KPI của tôi
export const getMyKpiPlan = async (month, year) => {
  const response = await apiClient.get('/kpi/my-plan', { params: { month, year } });
  return response.data;
};

// Tạo kế hoạch KPI của tôi
export const createMyKpiPlan = async (planData) => {
  const response = await apiClient.post('/kpi/my-plan', planData);
  return response.data;
};

// ================== Các API khác ==================

// Tải file (PDF/Excel/…)
const downloadFile = async (url, filename) => {
  const response = await axios.get(url, { responseType: 'blob' });
  const href = window.URL.createObjectURL(response.data);
  const link = document.createElement('a');
  link.href = href;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Xuất phiếu lương PDF
export const exportPayslipPDF = (payslipId) => {
  downloadFile(`${API_BASE_URL}/export/payslip/${payslipId}/pdf`, `payslip-${payslipId}.pdf`);
};

// Gửi thông báo Zalo
export const sendZaloNotificationAPI = (payslipId) => {
  return axios.post(`${API_BASE_URL}/notify/zalo/${payslipId}`);
};

// CRUD thư viện KPI
export const createKpiInLibrary = async (kpiData) => {
  const response = await apiClient.post('/api/kpi-library', kpiData);
  return response.data;
};

export const updateKpiInLibrary = async (id, kpiData) => {
  const response = await apiClient.put(`/api/kpi-library/${id}`, kpiData);
  return response.data;
};

export const deleteKpiInLibrary = async (id) => {
  const response = await apiClient.delete(`/api/kpi-library/${id}`);
  return response.data;
};

// Nộp tự đánh giá KPI
export const submitMyKpiAssessment = async (assessmentData) => {
  const response = await apiClient.post('/kpi/my-plan/submit-assessment', assessmentData);
  return response.data;
};

// Danh sách cấp dưới để đánh giá
export const getSubordinatesForManager = async (filters) => {
  const response = await apiClient.get('/kpi/subordinates-for-evaluation', { params: filters });
  return response.data;
};

// Duyệt KPI hàng loạt
export const bulkApproveKpis = async (planIds) => {
  const response = await apiClient.post('/api/kpi/bulk-approve', { planIds });
  return response.data;
};

// Khía cạnh KPI
export const getKpiAspects = async () => {
  const response = await apiClient.get('/api/kpi-aspects');
  return response.data;
};

// Kết quả KPI đơn vị theo tháng
export const getUnitKpiResults = async (filters) => {
  const response = await apiClient.get('/api/company-kpi-results', { params: filters });
  return response.data;
};

// Lưu kết quả KPI đơn vị theo tháng
export const saveUnitKpiResults = async (payload) => {
  const response = await apiClient.post('/api/company-kpi-results', payload);
  return response.data;
};

// Tổng hợp theo tháng (dùng axiosInstance phụ)
export const getMonthlySummary = async (companyId, year, month) => {
  const response = await axiosInstance.get('/api/company-kpi-summary', {
    params: { companyId, year, month }
  });
  return response.data;
};

// Xuất / Nhập Excel thư viện KPI (dùng instance chuẩn utils/api)
export const exportKpiLibrary = async (companyId) => {
  const response = await api.get(`/api/kpi-library/export`, {
    params: { companyId },
    responseType: 'blob',
  });
  return response.data;
};

export const importKpiLibrary = async (companyId, formData) => {
  const response = await api.post(`/api/kpi-library/import`, formData, {
    params: { companyId },
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};
