import React, { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import api from 'utils/api';
import PayslipModal from './PayslipModal';
import './PayrollDashboard.css';
import { FaFileImport, FaFileExport, FaDownload, FaCalculator, FaSave, FaEye } from 'react-icons/fa';

// Các hàm tiện ích
const normalizeRole = (s = '') => String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const VND = (n) => Math.round(Number(n || 0)).toLocaleString('vi-VN');

export default function PayrollDashboard() {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('all');
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
    const allowed = ['Admin', 'TongGiamDoc', 'Ketoan', 'Nhansu', 'TruongDonVi', 'Truongphong'];
    return allowed.includes(r);
  }, [me]);

  // Gộp các lời gọi API ban đầu vào một useEffect duy nhất
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        setError('');

        // 1. Tải thông tin người dùng
        const meRes = await api.get('/auth/me'); // Chắc chắn đường dẫn API đúng
        const meData = meRes.data || null;
        setMe(meData);

        // 2. Tải danh sách công ty
        const compRes = await api.get('/companies');
        const companyList = compRes.data || [];
        setCompanies(companyList);

        // 3. Tự động chọn công ty dựa trên thông tin người dùng hoặc công ty đầu tiên
        let defaultCompanyId = '';
        if (meData?.company_id) {
          defaultCompanyId = meData.company_id;
        } else if (companyList.length > 0) {
          defaultCompanyId = companyList[0].id;
        }
        setSelectedCompany(defaultCompanyId);

        // 4. Tải danh sách phòng ban sau khi đã chọn công ty
        if (defaultCompanyId) {
          const deptRes = await api.get('/departments', { params: { company_id: defaultCompanyId } });
          setDepartments(deptRes.data || []);
        }

      } catch (err) {
        console.error("Lỗi khi tải dữ liệu ban đầu:", err);
        setError('Không thể tải dữ liệu ban đầu. Vui lòng kiểm tra kết nối server.');
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []); // [] đảm bảo chỉ chạy một lần khi component mount

  // Tải dữ liệu bảng lương mỗi khi bộ lọc (công ty, phòng ban, tháng, năm) thay đổi
  const loadPayrollData = useCallback(() => {
    if (!selectedCompany || !month || !year) return;
    setLoading(true);
    setError('');
    const params = { company_id: selectedCompany, month, year, department_id: selectedDepartment };
    
    api.get('/payroll/summary', { params }).then(res => {
        setRows(Array.isArray(res.data) ? res.data : []);
    }).catch(err => {
        setError('Không tải được bảng lương.');
        console.error(err);
    }).finally(() => setLoading(false));
  }, [selectedCompany, selectedDepartment, month, year]);

  useEffect(() => {
    // Gọi loadPayrollData khi selectedCompany, selectedDepartment, month, year thay đổi
    loadPayrollData();
  }, [loadPayrollData]); // Dependency array bao gồm loadPayrollData

  // Các hàm xử lý khác không thay đổi...
  
  // Hàm xử lý khi thay đổi giá trị trong các ô input
  const handleInputChange = (employeeId, field, value) => {
    setRows(currentRows =>
      currentRows.map(row => {
        if (row.employee_id === employeeId) {
          let updatedRow = { ...row, [field]: value };
          const toNumber = (v) => Number(v || 0);
  
          // Lấy tất cả các giá trị cần thiết từ updatedRow
          const luongKPI = toNumber(updatedRow.luong_kpi);
          const luongBH = toNumber(updatedRow.luongBH); // Lương đóng bảo hiểm
          
          // Các ngày công và khoản cộng/trừ người dùng nhập
          const holidayWorkdays = toNumber(updatedRow.holiday_workdays);
          const workdays_200_percent = toNumber(updatedRow.workdays_200_percent);
          const workdays_300_percent = toNumber(updatedRow.workdays_300_percent);
          const otherAdditions = toNumber(updatedRow.other_additions);
          const otherDeductions = toNumber(updatedRow.other_deductions);
  
          // Các khoản trừ cố định (đã có)
          const bhxh = toNumber(updatedRow.bhxh_deduction);
          const bhyt = toNumber(updatedRow.bhyt_deduction);
          const bhtn = toNumber(updatedRow.bhtn_deduction);
          const bhtnld = toNumber(updatedRow.bhtnld_deduction);
          const unionFee = toNumber(updatedRow.union_fee);
          const personalIncomeTax = toNumber(updatedRow.personal_income_tax);
  
          // --- BẮT ĐẦU TÍNH TOÁN LẠI ---
          const standardWorkdays = 26;
          const dailyRateKPI = luongKPI / standardWorkdays; // Đơn giá lương KPI
          const dailyRateBH = luongBH / standardWorkdays; // Đơn giá lương BH
  
          // 1. Tính các khoản thu nhập làm thêm
          const holidayPay = dailyRateBH * holidayWorkdays; // Lương ngày lễ dùng lương BH
          const overtime200Pay = dailyRateKPI * workdays_200_percent * 2; // Lương làm thêm 200%
          const overtime300Pay = dailyRateKPI * workdays_300_percent * 3; // Lương làm thêm 300%
  
          // 2. Tính lại TỔNG THU NHẬP
          // Đã cộng thêm các khoản làm thêm và "Cộng khác"
          updatedRow.tongThuNhap = luongKPI + holidayPay + overtime200Pay + overtime300Pay + otherAdditions;
          
          // 3. Tính lại TỔNG TRỪ
          // Đã cộng thêm khoản "Trừ khác"
          updatedRow.tongTru = bhxh + bhyt + bhtn + bhtnld + unionFee + personalIncomeTax + otherDeductions;
          
          // 4. Tính toán lại LƯƠNG THỰC NHẬN
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
    if (!selectedCompany) return;
    // Kiểm tra xem có dòng nào để tính không
    if (rows.length === 0) {
      alert('Không có dữ liệu nhân viên để tính lương.');
      return;
    }
    
    try {
      setCalcLoading(true);
      setError('');
      // Gửi toàn bộ dữ liệu 'rows' hiện tại lên server
      await api.post('/payroll/calculate', {
        company_id: selectedCompany,
        month, year,
        department_id: selectedDepartment,
        employee_data: rows // Gửi kèm mảng dữ liệu nhân viên
      });
      alert('Đã tính và lưu lương thành công!');
      loadPayrollData(); // Tải lại dữ liệu mới nhất từ server
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

  const handleCancelModal = () => {
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
            <select className="form-select" value={selectedCompany} onChange={(e) => setSelectedCompany(e.target.value)}>
              <option value="">-- Chọn công ty --</option>
              {companies.map((comp) => (<option key={comp.id} value={comp.id}>{comp.company_name}</option>))}
            </select>
          </div>
          <div className="form-group">
            <label>Phòng ban</label>
            <select className="form-select" value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)} disabled={!selectedCompany}>
              <option value="all">Tất cả phòng ban</option>
              {departments.map((dept) => (<option key={`dept-${dept.id || Math.random()}`} value={dept.id}> {dept.department_name} </option>))}
            </select>
          </div>
          <div className="form-group">
            <label>Tháng/Năm</label>
            <div className="month-year-group">
              <select className="form-select" value={month} onChange={(e) => setMonth(Number(e.target.value))}>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (<option key={m} value={m}>{m}</option>))}
              </select>
              <select className="form-select" value={year} onChange={(e) => setYear(Number(e.target.value))}>
                {[...Array(5).keys()].map(i => { const y = new Date().getFullYear() - 2 + i; return <option key={y} value={y}>{y}</option>; })}
              </select>
            </div>
          </div>
        </div>
        <div className="action-group">
          <button className="btn btn-icon btn-primary" onClick={onCalculate} disabled={calcLoading || !selectedCompany}>
            <FaCalculator /> {calcLoading ? 'Đang tính...' : 'Tính lương'}
          </button>
          <button className="btn btn-icon btn-secondary" onClick={handleSaveChanges} disabled={loading || !canOperate}>
            <FaSave /> {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
          <button className="btn btn-icon" onClick={onDownloadTemplate} disabled={!canOperate}>
            <FaDownload /> Tải mẫu
          </button>
          <button className="btn btn-icon" onClick={onImportAdjustments} disabled={!canOperate}>
            <FaFileImport /> Nhập Excel
          </button>
          <input ref={fileInputRef} type="file" accept=".xlsx,.xls" onChange={handleFileChange} hidden />
          <button className="btn btn-icon" onClick={onExportExcel} disabled={!canOperate || !rows.length}>
            <FaFileExport /> Xuất Excel
          </button>
        </div>
      </div>
      {error && <div className="notification-banner error">{error}</div>}
      <div className="table-wrapper">
        <table className="payroll-table">
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
              <tr><td colSpan="9" className="text-center">Đang tải dữ liệu...</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan="9" className="text-center">Chưa có dữ liệu bảng lương.</td></tr>
            ) : (
              rows.map((r, index) => (
                <tr key={r.employee_id}>
                  <td>{index + 1}</td>
                  <td>{r.employee_code}</td>
                  <td>{r.full_name}</td>
                  <td>{r.position_name || r.role}</td>
                  <td className="col-numeric">{VND(r.luong_kpi)}</td>
                  <td>
              <input
                type="number"
                className="editable-cell-input"
                value={r.actual_workdays || ''}
                onChange={(e) => handleInputChange(r.employee_id, 'actual_workdays', e.target.value)}
                placeholder="Nhập..."
              />
            </td>
            <td>
              <input
                type="number"
                className="editable-cell-input"
                value={r.holiday_workdays || ''}
                onChange={(e) => handleInputChange(r.employee_id, 'holiday_workdays', e.target.value)}
                placeholder="Nhập..."
              />
            </td>
            <td>
              <input
                type="number"
                className="editable-cell-input"
                value={r.workdays_200_percent || ''}
                onChange={(e) => handleInputChange(r.employee_id, 'workdays_200_percent', e.target.value)}
                placeholder="Nhập..."
              />
            </td>
            <td>
              <input
                type="number"
                className="editable-cell-input"
                value={r.workdays_300_percent || ''}
                onChange={(e) => handleInputChange(r.employee_id, 'workdays_300_percent', e.target.value)}
                placeholder="Nhập..."
              />
            </td>
            <td>
              <input
                type="number"
                className="editable-cell-input"
                value={r.other_additions || ''}
                onChange={(e) => handleInputChange(r.employee_id, 'other_additions', e.target.value)}
                placeholder="Nhập..."
              />
            </td>
            <td>
              <input
                type="number"
                className="editable-cell-input"
                value={r.other_deductions || ''}
                onChange={(e) => handleInputChange(r.employee_id, 'other_deductions', e.target.value)}
                placeholder="Nhập..."
              />
            </td>
                  <td className="col-numeric">{VND(r.tongThuNhap)}</td>
                  <td className="col-numeric">{VND(r.tongTru)}</td>
                  <td className="col-numeric col-net">{VND(r.net_salary)}</td>
                  <td>
                    <button className="btn-icon" onClick={() => handleViewDetails(r)}>
                      <FaEye />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {selectedPayslip && (
        <PayslipModal
          visible={isModalVisible}
          onCancel={handleCancelModal}
          data={selectedPayslip}
        />
      )}
    </div>
  );
}
