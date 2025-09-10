import React, { useState, useEffect, useContext, useCallback } from 'react';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import EmployeeForm from './EmployeeForm'; // Import form component
import './HrmStyle.css'; // Import file CSS chung



const HrmDashboard = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false); // State để mở/đóng modal
    const [companies, setCompanies] = useState([]); // State lưu danh sách công ty
    const [selectedCompany, setSelectedCompany] = useState(''); // State lưu công ty được chọn để lọc

    const isAdmin = user?.role === 'Admin';

    const fetchEmployees = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/employees');
            setEmployees(res.data.data || []); 
        } catch (err) {
            setError(err.response?.data?.error || 'Không thể tải danh sách nhân viên.');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchCompanies = useCallback(async () => {
        try {
            const res = await api.get('/employees/data-for-form');
            setCompanies(Array.isArray(res.data?.companies) ? res.data.companies : []);
        } catch (err) {
            console.error("Lỗi tải danh sách đơn vị:", err);
            // Có thể setError hoặc hiển thị thông báo khác nếu cần
        }
    }, []);

    useEffect(() => {
        fetchEmployees();
        fetchCompanies(); // Gọi API để lấy danh sách công ty khi component mount
    }, [fetchEmployees, fetchCompanies]);

    const handleSuccess = () => {
        setIsFormOpen(false); // Đóng modal
        fetchEmployees(); // Tải lại danh sách nhân viên
    };

    const filteredEmployees = (employees ?? []).filter((emp = {}) => {
        const matchesSearchTerm = (emp.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    (emp.employee_code || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCompany = selectedCompany ? emp.company_id === parseInt(selectedCompany) : true;
        return matchesSearchTerm && matchesCompany;
    });

    return (
        <div className="hrm-page-container">
            <div className="hrm-header">
                <h1>Quản lý Nhân sự</h1>
                {isAdmin && (
                    <button className="btn btn--primary" onClick={() => setIsFormOpen(true)}>
                        <i className="fas fa-plus"></i> Thêm nhân viên
                    </button>
                )}
            </div>

            <div className="hrm-toolbar">
                <input
                    type="text"
                    placeholder="Tìm kiếm theo tên hoặc mã nhân viên..."
                    className="search-input"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <select
                    className="filter-select"
                    value={selectedCompany}
                    onChange={(e) => setSelectedCompany(e.target.value)}
                >
                    <option value="">Tất cả đơn vị</option>
                    {companies.map(company => (
                        <option key={company.id} value={company.id}>{company.company_name}</option>
                    ))}
                </select>
            </div>

            {loading ? (
                <p>Đang tải...</p>
            ) : error ? (
                <p className="error-message">{error}</p>
            ) : (
                <div className="hrm-table-container">
                    <table className="hrm-table">
                        <thead>
                            <tr>
                                <th>Mã NV</th>
                                <th>Họ và Tên</th>
                                <th>Phòng ban</th>
                                <th>Chức vụ</th>
                                <th>Trạng thái</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredEmployees.map(emp => (
                                <tr key={emp.id}>
                                    <td>{emp.employee_code}</td>
                                    <td>{emp.full_name}</td>
                                    <td>{emp.department_name || 'N/A'}</td>
                                    <td>{emp.position_name || 'N/A'}</td>
                                    <td>
                                        <span className={`status-badge status--${emp.status === 'Đang làm việc' ? 'active' : 'inactive'}`}>
                                            {emp.status}
                                        </span>
                                    </td>
                                    <td>
                                        <button className="action-btn" onClick={() => navigate(`/hrm/employees/${emp.id}`)}>
                                            <i className="fas fa-eye"></i> Xem hồ sơ
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal thêm/sửa nhân viên */}
            {isFormOpen && (
                <div className="modal-backdrop">
                    <EmployeeForm
                        employee={null} // Truyền null để form ở chế độ "Thêm mới"
                        onSuccess={handleSuccess}
                        onClose={() => setIsFormOpen(false)}
                    />
                </div>
            )}
        </div>
    );
};

export default HrmDashboard;
