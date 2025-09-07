// src/components/salary/SalaryPage.js
import React, { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';

const API_BASE_URL = 'http://localhost:5000';

const SalaryPage = () => {
    const { user } = useContext(AuthContext);
    const [salaries, setSalaries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedEmployee, setSelectedEmployee] = useState(''); // For filtering by employee
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [employees, setEmployees] = useState([]); // For dropdown of employees

    const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);
    // eslint-disable-next-line no-unused-vars
    const [currentAdjustment, setCurrentAdjustment] = useState(null); // For salary adjustments

    // eslint-disable-next-line no-unused-vars
    const handleOpenAdjustment = () => { // Lỗi: 'handleOpenAdjustment' is assigned a value but never used
        setIsAdjustmentModalOpen(true);
        // setCurrentAdjustment({ ... });
    };

    const isAllowedToManage = user?.role === 'KeToan' || user?.role === 'Admin'; // Lỗi: 'isAllowedToManage' is assigned a value but never used

    const fetchEmployees = useCallback(async () => {
        if (!isAllowedToManage) return; // Use the variable here
        try {
            const res = await axios.get(`${API_BASE_URL}/api/employees`);
            setEmployees(res.data);
        } catch (err) {
            console.error("Error fetching employees:", err.message);
        }
    }, [isAllowedToManage]); // Add isAllowedToManage to dependencies

    const fetchSalaries = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                employee_id: selectedEmployee,
                month: selectedMonth,
                year: selectedYear
            };
            const res = await axios.get(`${API_BASE_URL}/api/salary`, { params });
            setSalaries(res.data);
        } catch (err) {
            setError(err.response?.data?.error || 'Không thể tải dữ liệu lương.');
        } finally {
            setLoading(false);
        }
    }, [selectedEmployee, selectedMonth, selectedYear]);

    useEffect(() => {
        if (isAllowedToManage) { // Use the variable here as well
            fetchEmployees();
        }
    }, [isAllowedToManage, fetchEmployees]); // Add isAllowedToManage and fetchEmployees to dependencies

    useEffect(() => {
        fetchSalaries();
    }, [fetchSalaries]);

    const handleApproveSalary = async (salaryId) => {
        if (window.confirm('Bạn có chắc muốn duyệt bảng lương này?')) {
            try {
                await axios.post(`${API_BASE_URL}/api/salary/${salaryId}/approve`);
                alert('Duyệt bảng lương thành công!');
                fetchSalaries();
            } catch (err) {
                alert(err.response?.data?.error || 'Có lỗi khi duyệt bảng lương.');
            }
        }
    };

    return (
        <div className="salary-page-container">
            <h2>Quản lý Lương</h2>

            {isAllowedToManage && ( // Sử dụng isAllowedToManage để điều khiển hiển thị
                <div className="filter-controls">
                    <select value={selectedEmployee} onChange={e => setSelectedEmployee(e.target.value)}>
                        <option value="">Tất cả nhân viên</option>
                        {employees.map(emp => (
                            <option key={emp.id} value={emp.id}>{emp.full_name}</option>
                        ))}
                    </select>
                    <select value={selectedMonth} onChange={e => setSelectedMonth(parseInt(e.target.value))}>
                        {[...Array(12).keys()].map(i => <option key={i + 1} value={i + 1}>Tháng {i + 1}</option>)}
                    </select>
                    <select value={selectedYear} onChange={e => setSelectedYear(parseInt(e.target.value))}>
                        {[...Array(5).keys()].map(i => <option key={new Date().getFullYear() - 2 + i} value={new Date().getFullYear() - 2 + i}>{new Date().getFullYear() - 2 + i}</option>)}
                    </select>
                    <button onClick={handleOpenAdjustment} className="action-btn">Điều chỉnh lương</button>
                </div>
            )}

            {loading ? (
                <p>Đang tải dữ liệu lương...</p>
            ) : error ? (
                <p className="error-message">{error}</p>
            ) : salaries.length === 0 ? (
                <p>Chưa có dữ liệu lương cho các tiêu chí đã chọn.</p>
            ) : (
                <div className="salary-table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Mã NV</th>
                                <th>Họ và Tên</th>
                                <th>Tháng</th>
                                <th>Năm</th>
                                <th>Lương cơ bản</th>
                                <th>Thưởng KPI</th>
                                <th>Phụ cấp</th>
                                <th>Khấu trừ</th>
                                <th>Lương thực nhận</th>
                                <th>Trạng thái</th>
                                {isAllowedToManage && <th>Hành động</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {salaries.map(salary => (
                                <tr key={salary.id}>
                                    <td>{salary.employee_code}</td>
                                    <td>{salary.full_name}</td>
                                    <td>{salary.month}</td>
                                    <td>{salary.year}</td>
                                    <td>{salary.base_salary}</td>
                                    <td>{salary.kpi_bonus}</td>
                                    <td>{salary.allowances}</td>
                                    <td>{salary.deductions}</td>
                                    <td>{salary.final_salary}</td>
                                    <td>{salary.status}</td>
                                    {isAllowedToManage && (
                                        <td>
                                            {salary.status === 'Chờ duyệt' && (user?.role === 'Admin' || user?.role === 'TongGiamDoc') && (
                                                <button onClick={() => handleApproveSalary(salary.id)} className="action-btn approve-btn">Duyệt</button>
                                            )}
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Adjustment Modal */}
            {isAdjustmentModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Điều chỉnh lương</h3>
                        {/* Form for salary adjustment */}
                        <button onClick={() => setIsAdjustmentModalOpen(false)}>Đóng</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SalaryPage;