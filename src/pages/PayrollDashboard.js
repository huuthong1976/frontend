import React, { useEffect, useMemo, useState, useRef, useCallback } from 'react';

import api from 'utils/api';
import PayslipModal from './PayslipModal';
import './PayrollDashboard.css';
import { Button, message} from 'antd';
import { PrinterOutlined } from '@ant-design/icons';
import {  FaCalculator, FaSave, FaEye } from 'react-icons/fa';
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
    const allowed = ['Admin','TongGiamDoc','KeToan','Nhansu','TruongDonVi'];
    return allowed.includes(r);
  }, [me]);

  // Tải dữ liệu ban đầu
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        setError('');

        const meRes = await api.get('/api/auth/me');
        const meData = meRes?.data || null;
        setMe(meData);

        const compRes = await api.get('/api/companies');
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
          const deptRes = await api.get('/api/departments', { params: { company_id: defaultCompanyId } });
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
        const deptRes = await api.get('/api/departments', { params: { company_id: selectedCompany } });
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
    api.get('/api/payroll/summary', { params })
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
      await api.post('/api/payroll/save-adjustments', { month, year, adjustments: rows });
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
      await api.post('/api/payroll/calculate', {
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
  const onExportExcel = () => {
    try {
      const src = Array.isArray(rows) ? rows : [];
      if (!src.length) {
        message.info('Không có dữ liệu để xuất.');
        return;
      }
  
      const label = `${year}-${String(month).padStart(2, '0')}`;
  
      // Keys phù hợp dữ liệu hiện tại trong bảng
      const keys = [
        'employee_code',
        'full_name',
        'position_name',
        'luong_kpi',
        'actual_workdays',
        'holiday_workdays',
        'workdays_200_percent',
        'workdays_300_percent',
        'other_additions',
        'other_deductions',
        'tongThuNhap',
        'tongTru',
        'net_salary',
      ].filter(k => k in (src[0] || {}));
  
      const escape = (v) => {
        const s = v == null ? '' : String(v);
        return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
      };
  
      const lines = [
        keys.join(','),
        ...src.map(r => keys.map(k => escape(r?.[k])).join(',')),
      ];
      const csv = lines.join('\n');
  
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payroll_${label}.csv`;
      a.click();
      URL.revokeObjectURL(url);
  
      message.success('Đã xuất CSV.');
    } catch (e) {
      console.error('onExportExcel error:', e);
      message.error('Xuất CSV thất bại.');
    }
  };
  const onDownloadTemplate = () => {
    try {
      const headers = ['employee_code','adjustment_type','amount','note'];
      const csv = headers.join(',') + '\n';
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'payroll_adjustments_template.csv';
      a.click();
      URL.revokeObjectURL(url);
      message.success('Đã tải file mẫu điều chỉnh.');
    } catch (e) {
      console.error('onDownloadTemplate error:', e);
      message.error('Tải file mẫu thất bại.');
    }
  };
  const onImportAdjustments = () => {
    if (fileInputRef?.current) {
      fileInputRef.current.click();
      return;
    }
    const input = document.getElementById('adjustments-file-input');
    if (input) {
      input.click();
      return;
    }
    message.info("Hãy chọn file CSV qua nút 'Nhập điều chỉnh (CSV)'.");
  };
  const handleFileChange = async (eOrInfo) => {
    try {
      const file =
        (eOrInfo?.target?.files && eOrInfo.target.files[0]) ||
        (eOrInfo?.file?.originFileObj) ||
        (eOrInfo?.file) ||
        null;
  
      if (!file) {
        message.warning('Không tìm thấy file.');
        return;
      }
  
      const text = (file.text && (await file.text())) || await new Promise((res, rej) => {
        const reader = new FileReader();
        reader.onload = () => res(reader.result || '');
        reader.onerror = rej;
        reader.readAsText(file, 'utf-8');
      });
  
      const lines = (text || '').split(/\r?\n/).filter(l => String(l).trim() !== '');
      if (!lines.length) {
        message.warning('File trống.');
        return;
      }
  
      const headers = lines[0].split(',').map(h => h.trim());
      const adjustments = lines.slice(1).map(line => {
        const cols = line.split(',');
        const obj = {};
        headers.forEach((h, i) => obj[h] = (cols[i] || '').trim());
        if (obj.amount) obj.amount = Number(obj.amount);
        return obj;
      });
  
      const label = `${year}-${String(month).padStart(2, '0')}`;
  
      await api.post('/api/payroll/adjustments/import', {
        month: label,
        adjustments,
      });
  
      message.success(`Đã nhập ${adjustments.length} dòng điều chỉnh cho ${label}.`);
      // Reload lại dữ liệu bằng hàm sẵn có của file
      if (typeof loadPayrollData === 'function') {
        loadPayrollData();
      }
    } catch (err) {
      console.error('handleFileChange error:', err);
      message.error('Nhập điều chỉnh thất bại. Vui lòng kiểm tra file CSV.');
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
          <input
            id="adjustments-file-input"
            type="file"
            accept=".csv"
            style={{ display: 'none' }}
            onChange={handleFileChange}
            ref={fileInputRef}
          />
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
              <button onClick={onExportExcel}>Xuất CSV</button>
              <button onClick={onDownloadTemplate}>Tải mẫu điều chỉnh</button>
              <button onClick={onImportAdjustments}>Nhập điều chỉnh (CSV)</button>
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