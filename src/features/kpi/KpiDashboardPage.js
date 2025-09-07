// KpiDashboardPage.js (Phiên bản Hoàn chỉnh)

import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom'; // Sử dụng cho nút "Xem chi tiết"
import { Card, Table, Select, Space, Typography, Spin, Alert, Tag } from 'antd';
// import { useAuth } from '../context/AuthContext'; // Import hook để lấy thông tin user
// import { getKpiSummary, getCompanies } from '../services/api'; // Import các hàm gọi API

const { Title, Text } = Typography;
const { Option } = Select;

// --- Custom Hook: Chứa toàn bộ logic và state cho trang Dashboard ---
const useKpiDashboardData = (initialUser) => {
    const [plans, setPlans] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        month: new Date().getMonth() + 1, // Mặc định tháng hiện tại
        year: new Date().getFullYear(),   // Mặc định năm hiện tại
        // Tự động gán companyId nếu user là Manager, ngược lại để trống cho Admin/TGĐ chọn
        companyId: initialUser?.role === 'manager' ? initialUser.company_id : undefined,
    });

    const fetchData = useCallback(async () => {
        if (!initialUser) return; // Nếu chưa có thông tin user, không làm gì cả
        
        setLoading(true);
        setError(null);
        try {
            // Gọi đồng thời 2 API để tăng tốc độ tải trang
            const [plansData, companiesData] = await Promise.all([
                // getKpiSummary(filters), // << THAY BẰNG API THẬT
                new Promise(resolve => resolve([])), // Giả lập API plans
                
                // Chỉ gọi API lấy danh sách công ty khi user là Admin/TGĐ
                (initialUser.role === 'admin' || initialUser.role === 'director')
                    // ? getCompanies() // << THAY BẰNG API THẬT
                    ? new Promise(resolve => resolve([{id: 1, name: "ĐV Thành viên A"}, {id: 2, name: "ĐV Thành viên B"}])) // Giả lập
                    : Promise.resolve([]) // Manager hoặc User không cần danh sách này
            ]);
            
            setPlans(plansData);
            setCompanies(companiesData);
        } catch (err) {
            setError('Không thể tải dữ liệu. Vui lòng thử lại.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [filters, initialUser]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { plans, companies, loading, error, filters, setFilters, refetch: fetchData };
};


// --- Component Chính: Chỉ chịu trách nhiệm hiển thị ---
const KpiDashboardPage = () => {
    // const { user } = useAuth(); // Lấy thông tin người dùng từ context
    const user = { role: 'director', company_id: 1 }; // Giả lập user để test
    
    const { plans, companies, loading, error, filters, setFilters } = useKpiDashboardData(user);

    // --- Bổ sung các cột cần thiết cho giao diện chính ---
    const columns = [
        { title: 'STT', key: 'stt', align: 'center', width: 60, render: (text, record, index) => index + 1 },
        { title: 'Mã NV', dataIndex: 'employee_code', key: 'employee_code', width: 100 },
        { title: 'Tên nhân viên', dataIndex: 'full_name', key: 'full_name' },
        { title: 'Chức vụ', dataIndex: 'position_name', key: 'position_name' },
        { title: 'Tháng/Năm', key: 'period', align: 'center', render: (_, record) => `${record.month}/${record.year}` },
        { 
            title: 'Điểm KPI', 
            dataIndex: 'final_score', 
            key: 'final_score', 
            align: 'center',
            render: (score) => <Text strong style={{color: '#1677ff'}}>{score || 'N/A'}</Text>
        },
        { 
            title: 'Trạng thái', 
            dataIndex: 'status', 
            key: 'status', 
            align: 'center',
            render: (status) => {
                const color = status === 'COMPLETED' ? 'success' : status === 'PENDING_REVIEW' ? 'processing' : 'default';
                return <Tag color={color}>{status}</Tag>;
            }
        },
        {
            title: 'Hành động',
            key: 'action',
            align: 'center',
            render: (_, record) => (
                <Link to={`/kpi/plan/${record.employee_id}/${record.month}/${record.year}`}>
                    Xem chi tiết
                </Link>
            ),
        },
    ];

    if (!user) return <Spin />; // Chờ lấy thông tin người dùng

    return (
        <Card>
            <Title level={4}>Quản lý và Giám sát KPI</Title>
            <Space wrap style={{ marginBottom: 16 }}>
                {/* BỘ LỌC CÔNG TY: Lấy dữ liệu từ DB và chỉ hiển thị cho Admin/TGĐ */}
                {(user.role === 'admin' || user.role === 'director') && (
                    <Select
                        placeholder="Lọc theo đơn vị"
                        style={{ width: 250 }}
                        onChange={value => setFilters(f => ({ ...f, companyId: value }))}
                        value={filters.companyId}
                        allowClear
                    >
                        {companies.map(c => <Option key={c.id} value={c.id}>{c.name}</Option>)}
                    </Select>
                )}
                <Select defaultValue={filters.month} style={{ width: 120 }} onChange={value => setFilters(f => ({ ...f, month: value }))}>
                    {/* Tạo 12 options cho tháng */}
                    {Array.from({ length: 12 }, (_, i) => <Option key={i + 1} value={i + 1}>Tháng {i + 1}</Option>)}
                </Select>
                <Select defaultValue={filters.year} style={{ width: 120 }} onChange={value => setFilters(f => ({ ...f, year: value }))}>
                    {/* Tạo options cho các năm */}
                    <Option value={2025}>Năm 2025</Option>
                    <Option value={2024}>Năm 2024</Option>
                </Select>
            </Space>

            {error && <Alert message="Lỗi" description={error} type="error" showIcon style={{ marginBottom: 16 }} />}
            
            <Table
                columns={columns}
                dataSource={plans}
                loading={loading}
                rowKey="id"
                bordered
            />
        </Card>
    );
};

export default KpiDashboardPage;