import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';

// Import các component con mới
import FilterBar from './FilterBar';
import SummaryStats from './SummaryStats';
import EvaluationTable from './EvaluationTable';
// import TablePagination from './TablePagination'; // Sẽ dùng trong tương lai

import './ManagerKpiDashboard.css';

// ... (Phần code api và interceptor có thể giữ nguyên hoặc tách ra file riêng)
const api = axios.create({ baseURL: 'http://localhost:5000' });
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});


const ManagerKpiDashboard = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    // === STATE MANAGEMENT ===
    const [companies, setCompanies] = useState([]);
    const [subordinates, setSubordinates] = useState([]);
    const [summary, setSummary] = useState(null); // State cho thống kê
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedEmployees, setSelectedEmployees] = useState(new Set());
    
    // State cho bộ lọc, được quản lý tập trung
    const [filters, setFilters] = useState({
        company: user?.company_id || '',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        status: 'all',
        searchTerm: '' // State mới cho tìm kiếm
    });
    
    // === LOGIC NGHIỆP VỤ ===
    const isAdminOrCEO = user && (user.role === 'Admin' || user.role === 'TongGiamDoc');

    // Fetch danh sách công ty
    useEffect(() => {
        if (isAdminOrCEO) {
            api.get(`/api/companies`)
                .then(res => setCompanies(res.data))
                .catch(err => console.error("Lỗi khi tải danh sách công ty:", err));
        }
    }, [isAdminOrCEO]);

    // Fetch dữ liệu nhân viên dựa trên bộ lọc
    const fetchData = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const response = await api.get(`/api/kpi/subordinates-for-evaluation`, { params: filters });
            setSubordinates(response.data.subordinates); // Giả sử API trả về object
            setSummary(response.data.summary);       // Giả sử API trả về cả thống kê
        } catch (err) {
            setError('Không thể tải dữ liệu nhân viên.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [filters]); // Chỉ phụ thuộc vào filters

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Hàm xử lý nghiệp vụ
    const handleViewKpi = (employeeId) => {
        navigate(`/kpi-evaluation/${employeeId}`, { state: { month: filters.month, year: filters.year } });
    };

    const handleBulkApprove = async () => {
        // ... giữ nguyên logic duyệt hàng loạt của bạn
    };
    
    // === RENDER ===
    if (!user || !['Admin', 'TruongDonVi', 'TongGiamDoc', 'Truongphong'].includes(user.role)) {
        return <div>Truy cập bị từ chối.</div>
    }

    return (
        <div className="dashboard-page">
            <header className="dashboard-header">
                <h1>Bảng điều khiển - Chấm điểm & Duyệt KPI</h1>
                {/* Có thể thêm nút hành động ở đây */}
            </header>

            <SummaryStats stats={summary} />

            <FilterBar 
                filters={filters}
                onFilterChange={setFilters}
                companies={companies}
                isAdminOrCEO={isAdminOrCEO}
            />
            <div className="action-bar">
                <button 
                    className="btn btn-bulk-approve" 
                    onClick={handleBulkApprove}
                    disabled={selectedEmployees.size === 0}
                >
                    Duyệt {selectedEmployees.size > 0 ? `(${selectedEmployees.size})` : ''} mục đã chọn
                </button>
            </div>
            <EvaluationTable
                subordinates={subordinates}
                loading={loading}
                error={error}
                onViewKpi={handleViewKpi}
                selectedEmployees={selectedEmployees}
                setSelectedEmployees={setSelectedEmployees}
            />

            {/* <TablePagination /> */}
        </div>
    );
};

export default ManagerKpiDashboard;