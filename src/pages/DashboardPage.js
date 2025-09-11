// src/pages/DashboardPage.js
import React, { useState } from 'react';
import { Row, Col, Typography, Select, Spin, Alert } from 'antd';
import { useDashboardData } from '../hooks/useDashboardData';
import { useAuth } from '../context/AuthContext'; // ✅ Import useAuth

// Import các component con
import MetricWidget from './MetricWidget';
import KpiByDeptChart from './KpiByDeptChart';
import PendingTasks from './PendingTasks';
const { Title } = Typography;
const { Option } = Select;

const DashboardPage = () => {
    // ✅ BƯỚC 1: Lấy thông tin người dùng từ context
    const { user } = useAuth();
    
    // ✅ BƯỚC 2: Định nghĩa các vai trò được phép
    const allowedRoles = ['Admin', 'TongGiamDoc', 'TruongDonVi'];

    const [filters, setFilters] = useState({ companyId: 'all' }); // Bộ lọc mặc định
    const { summary, loading, error } = useDashboardData(filters);

    // ✅ BƯỚC 3: Kiểm tra quyền truy cập
    // Nếu người dùng không tồn tại hoặc vai trò không được phép, không hiển thị gì cả.
    if (!user || !allowedRoles.includes(user.role)) {
        return null;
    }
    
    // Các phần còn lại của component chỉ render nếu người dùng có quyền
    if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" /></div>;
    if (error) return <Alert message="Lỗi" description={error} type="error" showIcon />;
    if (!summary) return <div>Không có dữ liệu.</div>;

    return (
        <div>
            <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
                <Col>
                    <Title level={3}>Bảng điều khiển Tổng quan</Title>
                </Col>
                <Col>
                    {/* Bộ lọc đơn vị thành viên (dành cho Admin/TGĐ) */}
                    <Select defaultValue="all" style={{ width: 200 }} onChange={value => setFilters({ companyId: value })}>
                        <Option value="all">Toàn hệ thống</Option>
                        {summary.companies.map(c => <Option key={c.id} value={c.id}>{c.name}</Option>)}
                    </Select>
                </Col>
            </Row>

            {/* Hàng 1: Các chỉ số chính */}
            <Row gutter={[24, 24]}>
                <Col xs={24} sm={12} lg={6}>
                    <MetricWidget title="Tổng số nhân viên" value={summary.totalEmployees} iconType="user" />
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <MetricWidget title="Hoàn thành KPI T.8" value={`${summary.kpiCompletionRate}%`} iconType="kpi" />
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <MetricWidget title="Quỹ lương đã chi" value={summary.totalPayroll} isCurrency iconType="payroll" />
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <MetricWidget title="Kế hoạch cần duyệt" value={summary.pendingPlans} iconType="task" />
                </Col>
            </Row>

            {/* Hàng 2: Biểu đồ và công việc */}
            <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
                <Col xs={24} lg={16}>
                    <KpiByDeptChart data={summary.kpiByDepartment} />
                </Col>
                <Col xs={24} lg={8}>
                    <PendingTasks tasks={summary.pendingKpiTasks} title="Kế hoạch KPI cần duyệt" />
                </Col>
            </Row>
        </div>
    );
};

export default DashboardPage;