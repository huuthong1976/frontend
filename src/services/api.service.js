// src/services/api.service.js
import axios from 'axios';
import apiClient from './apiClient';
import axiosInstance from './axios.config';
import api from 'utils/api';
const API_BASE_URL = 'http://localhost:5000/api'; // dùng cho axios thuần khi tải file

// ================== API chính ==================
export const getUnitKpiRegistrations = async (companyId, year) => {
  // Gọi đến API GET /api/unit-kpi/registrations mà chúng ta đã tạo
  const response = await apiClient.get('/company-kpi', { 
      params: { 
          company_id: companyId, 
          year 
      } 
  });
  return response.data;
};
// Công ty
export const getCompanies = async () => {
  const response = await apiClient.get('/companies');
  return response.data;
};

// Phòng ban
export const getDepartments = async (params) => {
  const response = await apiClient.get('/departments', { params });
  return response.data;
};
/**
 * Lấy danh sách KPI từ thư viện để điền vào dropdown
 * @param {object} params - Các tham số lọc (ví dụ: company_id)
 */
export const getKpiLibrary = async (params) => {
  // Giả sử API endpoint của bạn là /kpi-library
  const response = await apiClient.get('/company-kpi/library', { params });
  return response.data;
};

/**
 * Tạo một đăng ký KPI Đơn vị mới
 * @param {object} data - Dữ liệu của KPI cần tạo
 */
export const createUnitKpiRegistration = async (payload) => {
  try {
      // ✅ Đảm bảo đường dẫn '/company-kpi-registrations' này khớp với route backend
      const response = await apiClient.post('/company-kpi', payload);
      return response.data;
  } catch (error) {
      throw error;
  }
};

/**
 * Cập nhật một đăng ký KPI Đơn vị đã có
 * @param {number} id - ID của đăng ký KPI cần cập nhật
 * @param {object} data - Dữ liệu cần cập nhật
 */
export const updateUnitKpiRegistration = async (id, payload) => {
  try {
      // Gọi đến endpoint PUT của backend
      const response = await apiClient.put(`/company-kpi/${id}`, payload);
      return response.data;
  } catch (error) {
      console.error('Lỗi khi cập nhật KPI:', error.response?.data || error.message);
      throw error;
  }
};
/**
 * Gửi dữ liệu phân bổ chỉ tiêu 12 tháng cho một KPI.
 * @param {number} registrationId - ID của KPI cha.
 * @param {object} allocationData - Dữ liệu chứa mảng 12 tháng.
 */
export const allocateKpiMonthlyTargets = async (registrationId, allocationData) => {
  try {
      const response = await apiClient.post(`/company-kpi/${registrationId}/allocate`, allocationData);
      return response.data;
  } catch (error) {
      console.error('Lỗi khi phân bổ KPI tháng:', error.response?.data || error.message);
      throw error;
  }
};
/**
 * Gửi yêu cầu đăng ký hàng loạt KPI
 * @param {Array<object>} kpiList - Danh sách các KPI cần tạo
 */
export const bulkCreateUnitKpiRegistrations = async (kpiList) => {
  const payload = { kpis: kpiList };
  const response = await apiClient.post('/company-kpi/bulk-register', payload);
  return response.data;
};
/**
 * Xóa một đăng ký KPI Đơn vị
 * @param {number} id - ID của đăng ký KPI cần xóa
 */
export const deleteUnitKpiRegistration = async (id) => {
  return apiClient.delete(`/company-kpi/${id}`); 
   
};
// Lấy kế hoạch KPI của người dùng theo tháng/năm
export const getMyKpiPlan = async (month, year) => {
  const response = await apiClient.get('/kpi/my-plan', { params: {month, year } });
  return response.data; // apiClient đã xử lý lỗi chung, chúng ta chỉ cần trả về data
};

// Tạo kế hoạch KPI mới
export const createMyKpiPlan = async (planData) => {
  // planData là object chứa { month, year, items }
  const response = await apiClient.post('/kpi/my-plan', planData);
  return response.data;
};
// ================== Các API khác ==================

// Tải file (PDF, Excel, …)
const downloadFile = async (url, filename) => {
    try {
      const response = await axios.get(url, { responseType: 'blob' });
      const href = window.URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = href;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Lỗi tải file:", error);
      alert("Không thể tải file. Vui lòng thử lại.");
    }
  };

// Xuất phiếu lương PDF
export const exportPayslipPDF = (payslipId) => {
  downloadFile(`${API_BASE_URL}/export/payslip/${payslipId}/pdf`, `payslip-${payslipId}.pdf`);
};

// Gửi thông báo Zalo
export const sendZaloNotificationAPI = (payslipId) => {
  return axios.post(`${API_BASE_URL}/notify/zalo/${payslipId}`);
};
// ✅ BỔ SUNG CÁC HÀM CRUD CHO THƯ VIỆN KPI

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
export const submitMyKpiAssessment = async (assessmentData) => {
  // Gọi đến API backend đã tạo ở bước trước
  const response = await apiClient.post('/kpi/my-plan/submit-assessment', assessmentData);
  return response.data;
};
// ✅ Lấy danh sách nhân viên cấp dưới để quản lý duyệt KPI
export const getSubordinatesForManager = async (filters) => {
  // filters là object chứa { company_id, month, year, status }
  const response = await apiClient.get('/kpi/subordinates-for-evaluation', { params: filters });
  return response.data;
};

// ✅ Gửi yêu cầu duyệt hàng loạt
export const bulkApproveKpis = async (planIds) => {
  // planIds là một mảng các ID của kế hoạch (hoặc employee_id)
  const response = await apiClient.post('/kpi/bulk-approve', { planIds });
  return response.data;
};
export const getKpiAspects = async () => {
  try {
      const response = await apiClient.get('/kpi-aspects'); // ✅ Đảm bảo endpoint này tồn tại ở backend
      return response.data;
  } catch (error) {
      console.error('Lỗi khi lấy danh sách Khía cạnh:', error.response?.data || error.message);
      throw error;
  }
};
/**
 * Lấy dữ liệu kết quả KPI hàng tháng của một đơn vị.
 * @param {object} filters - Chứa companyId, year, month.
 */
export const getUnitKpiResults = async (filters) => {
  try {
      const response = await apiClient.get('/company-kpi-results', { params: filters });
      return response.data;
  } catch (error) {
      console.error('Lỗi khi lấy dữ liệu kết quả KPI đơn vị:', error.response?.data || error.message);
      throw error;
  }
};
/**
 * Lưu (cập nhật) kết quả KPI hàng tháng của đơn vị.
 * @param {object} payload - Chứa filters (companyId, year, month) và mảng results.
 */
export const saveUnitKpiResults = async (payload) => {
  try {
      const response = await apiClient.post('/company-kpi-results', payload);
      return response.data;
  } catch (error) {
      console.error('Lỗi khi lưu kết quả KPI đơn vị:', error.response?.data || error.message);
      throw error;
  }
};
export const getMonthlySummary = async (companyId, year, month) => {
  try {
    // Bây giờ axiosInstance đã là instance được cấu hình đúng
    const response = await axiosInstance.get('/company-kpi-summary', {
      params: { companyId, year, month }
    });
    return response.data;
  } catch (error) {
    console.error('API Error getMonthlySummary:', error.response?.data || error.message);
    throw error.response?.data || new Error('Lỗi không xác định');
  }
};
// Hàm gọi API để xuất file Excel thư viện KPI
export const exportKpiLibrary = async (companyId) => {
  const response = await api.get(`/kpi-library/export`, {
      params: { companyId },
      responseType: 'blob', // Yêu cầu server trả về file
  });
  return response.data;
};

// Hàm gọi API để nhập file Excel thư viện KPI
export const importKpiLibrary = async (companyId, formData) => {
  const response = await api.post(`/kpi-library/import`, formData, {
      params: { companyId },
      headers: {
          'Content-Type': 'multipart/form-data',
      },
  });
  return response.data;
};
