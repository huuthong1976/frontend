// API wrappers cho module Payroll 3P
// Đồng bộ với các component: PayrollDashboard, PayslipModal

import api from '../utils/api';

/** Tạo query string an toàn */
const qs = (obj = {}) =>
  Object.entries(obj)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');

/** Lấy bảng lương tổng hợp (hiển thị trong bảng) */
export function getPayrollSummary({ company_id, month, year }) {
  return api.get(`/payroll/summary?${qs({ company_id, month, year })}`);
}

/** Tính lương 3P (P1/P2/P3 theo vai trò + các khoản BH/điều chỉnh) */
export function calculatePayroll({ company_id, month, year, rates }) {
  // rates ví dụ: { bhxh: 0.25, bhyt: 0.045, bhtn: 0.02 }
  return api.post('/payroll/calculate', { company_id, month, year, rates });
}

/** Xuất Excel bảng lương */
export function exportPayrollExcel({ company_id, month, year }) {
  return api.get(`/payroll/export?${qs({ company_id, month, year })}`, {
    responseType: 'blob',
  });
}

/** Tải file Excel mẫu để nhập điều chỉnh */
export function downloadPayrollTemplate() {
  return api.get('/payroll/template', { responseType: 'blob' });
}

/**
 * Nhập dữ liệu điều chỉnh từ Excel vào payrolls
 * THỨ TỰ THAM SỐ: (companyId, month, year, file)
 * - file: .xlsx/.xls
 * - server mapping tiêu đề cột đã xử lý ở router (/payroll/import-adjustments)
 */
export function importPayrollAdjustments(companyId, month, year, file) {
  const form = new FormData();
  form.append('file', file);
  return api.post(
    `/payroll/import-adjustments?${qs({ company_id: companyId, month, year })}`,
    form,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
}

/** Lấy phiếu lương chi tiết của 1 nhân viên (hiện trong modal) */
export function getPayslip({ employee_id, month, year, company_id }) {
  return api.get(
    `/payroll/payslip?${qs({ employee_id, month, year, company_id })}`
  );
}
