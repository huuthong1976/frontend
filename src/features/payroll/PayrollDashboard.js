import React, { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import api from '../../utils/api';
import PayslipModal from './PayslipModal';
import './PayrollDashboard.css';
import { Button } from 'antd';
import { PrinterOutlined } from '@ant-design/icons';
import { FaFileImport, FaFileExport, FaDownload, FaCalculator, FaSave, FaEye } from 'react-icons/fa';
import { handlePrintPayrollList } from './payrollPdfExporter';

// Các hàm tiện ích
const VND = (n) => Math.round(Number(n || 0)).toLocaleString('vi-VN');
const normalizeRole = (s = '') => String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

export default function PayrollDashboard() {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());

  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(''); // LUÔN string

  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('all'); // 'all' hoặc id (string)

  const [me, setMe] = useState(null);
  const [rows, setRows] = useState([]);

  const [loading, setLoading] = useState(false);
  const [calcLoading, setCalcLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedPayslip, setSelectedPayslip] = useState(null);

  const canOperate = useMemo(() => {
    const r = normalizeRole(me?.role || '');
    const allowed = ['admin','tonggiamdoc','ketoan','nhansu','truongdonvi','truongphong'];
    return allowed.includes(r);
  }, [me]);

  // Tải dữ liệu ban đầu
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        setError('');

        const meRes = await api.get('/auth/me');
        const meData = meRes?.data || null;
        setMe(meData);

        const compRes = await api.get('/companies');
        const companyList = Array.isArray(compRes?.data) ? compRes.data : [];
        setCompanies(companyList);

        let defaultCompanyId = '';
        if (meData?.company_id) {
          defaultCompanyId = String(meData.company_id);
        } else if (Array.isArray(meData?.companies) && meData.companies.length) {
          defaultCompanyId = String(meData.companies[0].id);
        } else if (companyList.length) {
          defaultCompanyId = String(companyList[0].id);
        }
        setSelectedCompany(defaultCompanyId);

        if (defaultCompanyId) {
          const deptRes = await api.get('/departments', { params: { company_id: defaultCompanyId } });
          setDepartments(Array.isArray(deptRes?.data) ? deptRes.data : []);
        } else {
          setDepartments([]);
        }
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu ban đầu:', err);
        setError('Không thể tải dữ liệu ban đầu. Vui lòng kiểm tra kết nối server.');
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  // MỖI KHI đổi công ty => nạp lại phòng ban & reset chọn phòng ban
  useEffect(() => {
    const fetchDepartments = async () => {
      if (!selectedCompany) {
        setDepartments([]);
        setSelectedDepartment('all');
        return;
      }
      try {
        const deptRes = await api.get('/departments', { params: { company_id: selectedCompany } });
        setDepartments(Array.isArray(deptRes?.data) ? deptRes.data : []);
        setSelectedDepartment('all');
      } catch (e) {
        console.error('Không tải được danh sách phòng ban:', e);
        setDepartments([]);
        setSelectedDepartment('all');
      }
    };
    fetchDepartments();
  }, [selectedCompany]);

  // Tải dữ liệu bảng lương
  const loadPayrollData = useCallback(() => {
    if (!selectedCompany || !month || !year) return;
    setLoading(true);
    setError('');
    const params = {
      company_id: selectedCompany,
      month,
      year,
      ...(selectedDepartment !== 'all' ? { department_id: selectedDepartment } : {})
    };
    api.get('/payroll/summary', { params })
      .then(res => setRows(Array.isArray(res.data) ? res.data : []))
      .catch(err => {
        setError('Không tải được bảng lương.');
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, [selectedCompany, selectedDepartment, month, year]);

  useEffect(() => {
    loadPayrollData();
  }, [loadPayrollData]);

  const handleInputChange = (employeeId, field, value) => {
    setRows(currentRows =>
      currentRows.map(row => {
        if (row.employee_id === employeeId) {
          let updatedRow = { ...row, [field]: value };
          const toNumber = (v) => Number(v || 0);
          const luongKPI = toNumber(updatedRow.luong_kpi);
          const holidayWorkdays = toNumber(updatedRow.holiday_workdays);
          const workdays_200_percent = toNumber(updatedRow.workdays_200_percent);
          const workdays_300_percent = toNumber(updatedRow.workdays_300_percent);
          const otherAdditions = toNumber(updatedRow.other_additions);
          const otherDeductions = toNumber(updatedRow.other_deductions);
          const bhxh = toNumber(updatedRow.bhxh_deduction);
          const bhyt = toNumber(updatedRow.bhyt_deduction);
          const bhtn = toNumber(updatedRow.bhtn_deduction);
          const bhtnld = toNumber(updatedRow.bhtnld_deduction);
          const unionFee = toNumber(updatedRow.union_fee);
          const personalIncomeTax = toNumber(updatedRow.personal_income_tax);
          const standardWorkdays = 26;
          const dailyRateKPI = luongKPI / standardWorkdays;
          const holidayPay = dailyRateKPI * holidayWorkdays; // Lương ngày lễ thường tính theo lương cơ bản/hợp đồng
          const overtime200Pay = dailyRateKPI * workdays_200_percent * 2;
          const overtime300Pay = dailyRateKPI * workdays_300_percent * 3;
          updatedRow.tongThuNhap = luongKPI + holidayPay + overtime200Pay + overtime300Pay + otherAdditions;
          updatedRow.tongTru = bhxh + bhyt + bhtn + bhtnld + unionFee + personalIncomeTax + otherDeductions;
          updatedRow.net_salary = updatedRow.tongThuNhap - updatedRow.tongTru;
          return updatedRow;
        }
        return row;
      })
    );
  };

  const handleSaveChanges = async () => {
    try {
      setLoading(true);
      setError('');
      await api.post('/payroll/save-adjustments', { month, year, adjustments: rows });
      alert('Đã lưu thay đổi thành công!');
      loadPayrollData();
    } catch (e) {
      setError(e?.response?.data?.error || 'Lưu thay đổi thất bại.');
    } finally {
      setLoading(false);
    }
  };

  const onCalculate = async () => {
    if (!selectedCompany || rows.length === 0) {
      alert('Không có dữ liệu nhân viên để tính lương.');
      return;
    }
    try {
      setCalcLoading(true);
      setError('');
      await api.post('/payroll/calculate', {
        company_id: selectedCompany,
        month, year,
        ...(selectedDepartment !== 'all' ? { department_id: selectedDepartment } : {}),
        employee_data: rows
      });
      alert('Đã tính và lưu lương thành công!');
      loadPayrollData();
    } catch (e) {
      setError(e?.response?.data?.error || 'Không tính được bảng lương.');
    } finally {
      setCalcLoading(false);
    }
  };

  const onExportExcel = async () => {
    try {
      const res = await api.get('/payroll/export', { params: { company_id: selectedCompany, month, year }, responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Luong_${month}_${year}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e?.response?.data?.error || 'Xuất Excel thất bại');
    }
  };

  const onDownloadTemplate = async () => {
    try {
      const res = await api.get('/payroll/template', { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Bang_luong_mau.xlsx';
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e?.response?.data?.error || 'Không tải được template');
    }
  };

  const onImportAdjustments = () => fileInputRef.current?.click();

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !selectedCompany) return;
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('file', file);
      await api.post(`/payroll/import-adjustments?company_id=${selectedCompany}&month=${month}&year=${year}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      loadPayrollData();
    } catch (err) {
      setError(err?.response?.data?.error || 'Không nhập được dữ liệu từ Excel.');
    } finally {
      setLoading(false);
      e.target.value = '';
    }
  };

  const handleViewDetails = (record) => {
    setSelectedPayslip(record);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedPayslip(null);
  };

  return (
    <div className="payroll-page">
      <div className="view-header">
        <h1 className="view-title">Bảng lương chi tiết</h1>
      </div>
      <div className="filter-card">
        <div className="filter-group">
          <div className="form-group">
            <label>Công ty</label>
            <select
              className="form-select"
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(String(e.target.value))}
            >
              <option value="">-- Chọn công ty --</option>
              {companies.map((comp) => (
                <option key={String(comp.id)} value={String(comp.id)}>
                  {comp.company_name || comp.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Phòng ban</label>
            <select
              className="form-select"
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(String(e.target.value))}
              disabled={!selectedCompany}
            >
              <option value="all">Tất cả phòng ban</option>
              {departments.map((dept) => (
                <option key={`dept-${String(dept.id)}`} value={String(dept.id)}>
                  {dept.department_name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Tháng/Năm</label>
            <div className="month-year-group">
              <select className="form-select" value={month} onChange={(e) => setMonth(Number(e.target.value))}>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
              <select className="form-select" value={year} onChange={(e) => setYear(Number(e.target.value))}>
                {[...Array(5).keys()].map(i => {
                  const y = new Date().getFullYear() - 2 + i;
                  return <option key={y} value={y}>{y}</option>;
                })}
              </select>
            </div>
          </div>
        </div>

        <div className="action-group">
          <button className="btn btn-icon btn-primary" onClick={onCalculate} disabled={calcLoading || !selectedCompany}>
            <FaCalculator /> {calcLoading ? 'Đang tính...' : 'Tính lương'}
          </button>
          
          {/* NÚT IN ĐÃ SỬA LẠI CHO ĐÚNG */}
          <Button 
            icon={<PrinterOutlined />} 
            onClick={() => {
              const company = companies.find(c => String(c.id) === selectedCompany);
              const companyName = company ? (company.company_name || company.name) : 'Không rõ';
              handlePrintPayrollList(rows, companyName, month, year);
            }}
            disabled={!rows.length}
          >
            In Bảng lương
          </Button>

          <button className="btn btn-icon btn-secondary" onClick={handleSaveChanges} disabled={loading || !canOperate}>
            <FaSave /> {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
          {/* ... các nút khác giữ nguyên ... */}
        </div>
      </div>

      {error && <div className="notification-banner error">{error}</div>}

      <div className="table-wrapper">
        <table className="payroll-table">
          {/* ... thead và tbody giữ nguyên như file của bạn ... */}
           <thead>
            <tr className="header-row">
              <th rowSpan={2}>STT</th>
              <th rowSpan={2}>Mã NV</th>
              <th rowSpan={2}>Họ và Tên</th>
              <th rowSpan={2}>Chức vụ</th>
              <th rowSpan={2} className="col-numeric">Lương KPI</th>
              <th className="col-editable">Ngày Công TT</th>
              <th className="col-editable">Ngày Công lễ</th>
              <th className="col-editable">Ngày Công 200%</th>
              <th className="col-editable">Ngày Công 300%</th>
              <th className="col-editable">Cộng Khác</th>
              <th className="col-editable">Trừ Khác</th>
              <th rowSpan={2} className="col-numeric">Tổng Thu Nhập</th>
              <th rowSpan={2} className="col-numeric">Tổng Trừ</th>
              <th rowSpan={2} className="col-numeric">Thực Nhận</th>
              <th rowSpan={2}>Chi tiết</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="15" className="text-center">Đang tải dữ liệu...</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan="15" className="text-center">Chưa có dữ liệu bảng lương.</td></tr>
            ) : (
              rows.map((r, index) => (
                <tr key={r.employee_id}>
                  <td>{index + 1}</td>
                  <td>{r.employee_code}</td>
                  <td>{r.full_name}</td>
                  <td>{r.position_name || r.role}</td>
                  <td className="col-numeric">{VND(r.luong_kpi)}</td>
                  <td><input type="number" className="editable-cell-input" value={r.actual_workdays || ''} onChange={(e) => handleInputChange(r.employee_id, 'actual_workdays', e.target.value)} placeholder="Nhập..."/></td>
                  <td><input type="number" className="editable-cell-input" value={r.holiday_workdays || ''} onChange={(e) => handleInputChange(r.employee_id, 'holiday_workdays', e.target.value)} placeholder="Nhập..."/></td>
                  <td><input type="number" className="editable-cell-input" value={r.workdays_200_percent || ''} onChange={(e) => handleInputChange(r.employee_id, 'workdays_200_percent', e.target.value)} placeholder="Nhập..."/></td>
                  <td><input type="number" className="editable-cell-input" value={r.workdays_300_percent || ''} onChange={(e) => handleInputChange(r.employee_id, 'workdays_300_percent', e.target.value)} placeholder="Nhập..."/></td>
                  <td><input type="number" className="editable-cell-input" value={r.other_additions || ''} onChange={(e) => handleInputChange(r.employee_id, 'other_additions', e.target.value)} placeholder="Nhập..."/></td>
                  <td><input type="number" className="editable-cell-input" value={r.other_deductions || ''} onChange={(e) => handleInputChange(r.employee_id, 'other_deductions', e.target.value)} placeholder="Nhập..."/></td>
                  <td className="col-numeric">{VND(r.tongThuNhap)}</td>
                  <td className="col-numeric">{VND(r.tongTru)}</td>
                  <td className="col-numeric col-net">{VND(r.net_salary)}</td>
                  <td><button className="btn-icon" onClick={() => handleViewDetails(r)}><FaEye /></button></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedPayslip && (
        <PayslipModal
          visible={isModalVisible}
          onClose={handleCloseModal}
          data={selectedPayslip}
        />
      )}
    </div>
  );
}