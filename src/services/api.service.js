// src/services/api.service.js
/**
 * Tập trung cấu hình gọi API.
 * Đọc baseURL theo thứ tự: Vite -> runtime (env.js / window.__ENV__) -> CRA -> fallback.
 */
import axios from 'axios';
import apiClient from './apiClient';
<<<<<<< HEAD
import axiosInstance from './axios.config';
import api from 'utils/api';
const API_BASE_URL = 'http://localhost:5000/api'; // dùng cho axios thuần khi tải file
=======
>>>>>>> f15a9d8302fa2b98bc412e4e61010564b5d3a109

// Lấy env Vite an toàn (tránh "import can only be used in import() or import.meta")
let viteEnv = null;
try {
  // Sẽ là truthy khi build bằng Vite
  viteEnv = (typeof import.meta !== 'undefined' && import.meta && import.meta.env) ? import.meta.env : null;
} catch {
  viteEnv = null;
}

const runtimeEnv =
  (typeof window !== 'undefined' && window.__ENV__) || null;

const craEnv =
  (typeof process !== 'undefined' && process.env) || null;

const baseURL =
  (viteEnv && viteEnv.VITE_API_BASE_URL) ||
  (runtimeEnv && runtimeEnv.API_BASE_URL) ||
  (craEnv && craEnv.REACT_APP_API_BASE_URL) ||
  'https://backend-production-bc73.up.railway.app'; // fallback cuối

const api = axios.create({
  baseURL,
  withCredentials: false,
  headers: { 'Content-Type': 'application/json' },
});

export default api;

// =============================================================================
// --- MODULE: QUẢN LÝ CHUNG (Công ty, Phòng ban, Chức vụ) ---
// =============================================================================
export const getCompanies = async () => {
  const response = await apiClient.get('/companies');
  return response.data;
};

export const getDepartments = async (params) => {
  const response = await apiClient.get('/departments', { params });
  return response.data;
};

export const getPositions = async () => {
  const response = await apiClient.get('/positions');
  return response.data;
};

// =============================================================================
// --- MODULE: QUẢN LÝ NGƯỜI DÙNG (ADMIN) ---
// =============================================================================
export const createUser = async (userData) => {
  const response = await apiClient.post('/users', userData);
  return response.data;
};

// =============================================================================
// --- MODULE: THƯ VIỆN KPI ---
// =============================================================================
export const getKpiLibrary = async (params) => {
  const response = await apiClient.get('/company-kpi/library', { params });
  return response.data;
};

export const createKpiInLibrary = async (kpiData) => {
  const response = await apiClient.post('/kpi-library', kpiData);
  return response.data;
};

export const updateKpiInLibrary = async (id, kpiData) => {
  const response = await apiClient.put(`/kpi-library/${id}`, kpiData);
  return response.data;
};

export const deleteKpiInLibrary = async (id) => {
  const response = await apiClient.delete(`/kpi-library/${id}`);
  return response.data;
};

// =============================================================================
// --- MODULE: KPI ĐƠN VỊ ---
// =============================================================================
export const getUnitKpiRegistrations = async (companyId, year) => {
  const response = await apiClient.get('/company-kpi', {
    params: { company_id: companyId, year }
  });
  return response.data;
};

export const createUnitKpiRegistration = async (payload) => {
  const response = await apiClient.post('/company-kpi', payload);
  return response.data;
};

export const updateUnitKpiRegistration = async (id, payload) => {
  const response = await apiClient.put(`/company-kpi/${id}`, payload);
  return response.data;
};

export const deleteUnitKpiRegistration = async (id) => {
  return apiClient.delete(`/company-kpi/${id}`);
};

export const bulkCreateUnitKpiRegistrations = async (kpiList) => {
  const payload = { kpis: kpiList };
  const response = await apiClient.post('/company-kpi/bulk-register', payload);
  return response.data;
};

export const allocateKpiMonthlyTargets = async (registrationId, allocationData) => {
  const response = await apiClient.post(`/company-kpi/${registrationId}/allocate`, allocationData);
  return response.data;
};

export const getUnitKpiResults = async (filters) => {
  const response = await apiClient.get('/company-kpi-results', { params: filters });
  return response.data;
};

export const saveUnitKpiResults = async (payload) => {
  const response = await apiClient.post('/company-kpi-results', payload);
  return response.data;
};

export const getMonthlySummary = async (companyId, year, month) => {
  const response = await apiClient.get('/company-kpi-summary', {
    params: { companyId, year, month }
  });
  return response.data;
};

// =============================================================================
// --- MODULE: KPI CÁ NHÂN ---
// =============================================================================
export const getMyKpiPlan = async (month, year) => {
  const response = await apiClient.get('/kpi/my-plan', { params: { month, year } });
  return response.data;
};

export const createMyKpiPlan = async (planData) => {
  const response = await apiClient.post('/kpi/my-plan', planData);
  return response.data;
};

export const submitMyKpiAssessment = async (assessmentData) => {
  const response = await apiClient.post('/kpi/my-plan/submit-assessment', assessmentData);
  return response.data;
};

// =============================================================================
// --- MODULE: CHỨC NĂNG QUẢN LÝ ---
// =============================================================================
export const getSubordinatesForManager = async (filters) => {
  const response = await apiClient.get('/kpi/subordinates-for-evaluation', { params: filters });
  return response.data;
};

export const bulkApproveKpis = async (planIds) => {
  const response = await apiClient.post('/api/kpi/bulk-approve', { planIds });
  return response.data;
};

// =============================================================================
// --- MODULE: TÁC VỤ ĐẶC BIỆT (File, Notification) ---
// =============================================================================
const downloadFile = async (url, filename) => {
  try {
    const response = await apiClient.get(url, { responseType: 'blob' });
    const href = window.URL.createObjectURL(response.data);
    const link = document.createElement('a');
    link.href = href;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(href);
  } catch (error) {
    console.error('Lỗi khi tải file:', error);
  }
};

export const exportPayslipPDF = (payslipId) => {
  downloadFile(`/export/payslip/${payslipId}/pdf`, `payslip-${payslipId}.pdf`);
};

export const exportKpiLibrary = async (companyId) => {
  downloadFile(`/kpi-library/export?companyId=${companyId}`, `kpi-library-export.xlsx`);
};

export const importKpiLibrary = async (companyId, formData) => {
  const response = await apiClient.post(
    `/kpi-library/import?companyId=${companyId}`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return response.data;
};

export const sendZaloNotificationAPI = (payslipId) => {
  return apiClient.post(`/notify/zalo/${payslipId}`);
};
