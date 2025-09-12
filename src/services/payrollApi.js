import api from '../utils/api'; 

export const getCompanies = () => api.get('/payroll/companies');
export const getDepartments = (companyId) => api.get('/api/payroll/departments', { params: { company_id: companyId } });
export const getPayrollSummary = (params) => api.get('/api/payroll/summary', { params });
export const calculatePayroll = (data) => api.post('/api/payroll/calculate', data);
export const saveAdjustments = (data) => api.post('/api/payroll/save-adjustments', data);
export const exportPayrollExcel = (params) => api.get('/api/payroll/export', { params, responseType: 'blob' });
export const downloadPayrollTemplate = () => api.get('/api/payroll/template', { responseType: 'blob' });
export const importPayrollAdjustments = (companyId, month, year, file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/payroll/import-adjustments', formData, {
    params: { company_id: companyId, month, year },
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

// Các API cho PayslipModal
export const getPayslipDetail = (params) => api.get('/api/payroll/payslip', { params });
export const exportPayslipPdf = (data) => api.post('/api/payroll/export-pdf', data, { responseType: 'blob' });
export const sendZaloNotification = (data) => api.post('/api/payroll/send-zalo', data);
export const sendEmailNotification = (data) => api.post('/api/payroll/send-email', data);
