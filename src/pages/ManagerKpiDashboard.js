/* ========================================================= */
/* FILE: src/pages/ManagerKpiDashboard.js (Đã sửa và hoàn chỉnh) */
/* ========================================================= */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Select, Table, Alert, Typography, Button, Space, Tag, message } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';
import { useManagerDashboardData } from '../hooks/useManagerDashboardData';
import { bulkApproveKpis } from '../services/api.service';

const { Title } = Typography;
const { Option } = Select;

const ManagerKpiDashboard = () => {
    const navigate = useNavigate();
    const { user, companies, subordinates, loading, error, filters, setFilters, refreshData } = useManagerDashboardData();
    const [selectedRowKeys, setSelectedRowKeys] = React.useState([]);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleBulkApprove = async () => {
        if (selectedRowKeys.length === 0) {
            return;
        }

        const planIds = selectedRowKeys;
        
        message.loading({ content: 'Đang duyệt...', key: 'bulk-approve-loading' });
        
        try {
            await bulkApproveKpis(planIds);
            message.success({ content: `Đã duyệt thành công ${planIds.length} mục.`, key: 'bulk-approve-loading' });

            setSelectedRowKeys([]);
            refreshData();
        } catch (err) {
            message.error({ content: err.response?.data?.error || 'Duyệt thất bại.', key: 'bulk-approve-loading' });
            console.error("Lỗi khi duyệt hàng loạt:", err);
        }
    };

    const columns = [
        { title: 'STT', key: 'index', render: (text, record, index) => index + 1 },
        { 
            title: 'Họ và Tên', 
            dataIndex: 'full_name', 
            key: 'full_name',
            render: (text, record) => (
                <a onClick={() => navigate(`/my-kpi-plan/${record.id}`, { state: { month: filters.month, year: filters.year } })}>
                    {text}
                </a>
            )
        },
        { title: 'Chức vụ', dataIndex: 'position_name', key: 'position_name' },
        { 
            title: 'Trạng thái', 
            dataIndex: 'kpi_status', 
            key: 'kpi_status',
            render: (status) => {
                const color = {
                    'Chờ TĐV chấm': 'processing',
                    'Chờ TGĐ chấm': 'warning',
                    'Hoàn thành': 'success',
                }[status] || 'default';
                return <Tag color={color}>{status || 'Chưa tạo'}</Tag>;
            }
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <Button onClick={() => navigate(`/my-kpi-plan/${record.id}`, { state: { month: filters.month, year: filters.year } })}>
                    Xem & Chấm điểm
                </Button>
            )
        }
    ];

    const rowSelection = {
        selectedRowKeys,
        onChange: (keys) => setSelectedRowKeys(keys),
    };

    const isAdminOrCEO = user?.role === 'Admin' || user?.role === 'TongGiamDoc';
    const currentYear = new Date().getFullYear();
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

    return (
        <Space direction="vertical" size="large" style={{ display: 'flex' }}>
            <Title level={3}>Bảng điều khiển - Duyệt KPI Nhân viên</Title>
            <Card>
                <Space wrap>
                    {isAdminOrCEO && (
                        <Select
                            style={{ width: 250 }}
                            placeholder="Chọn đơn vị"
                            value={filters.company_id}
                            onChange={value => handleFilterChange('company_id', value)}
                        >
                            {companies.map(c => <Option key={c.id} value={c.id}>{c.company_name || c.name}</Option>)}
                        </Select>
                    )}
                    {/* ✅ Thêm bộ lọc tháng */}
                    <Select
                        style={{ width: 120 }}
                        placeholder="Chọn tháng"
                        value={filters.month}
                        onChange={value => handleFilterChange('month', value)}
                    >
                        {months.map(m => <Option key={m} value={m}>Tháng {m}</Option>)}
                    </Select>
                    {/* ✅ Thêm bộ lọc năm */}
                    <Select
                        style={{ width: 120 }}
                        placeholder="Chọn năm"
                        value={filters.year}
                        onChange={value => handleFilterChange('year', value)}
                    >
                        {years.map(y => <Option key={y} value={y}>{y}</Option>)}
                    </Select>
                </Space>
            </Card>

            <Card>
                <div style={{ marginBottom: 16 }}>
                    <Button 
                        type="primary" 
                        icon={<CheckCircleOutlined />}
                        onClick={handleBulkApprove} 
                        disabled={selectedRowKeys.length === 0}
                    >
                        Duyệt hàng loạt ({selectedRowKeys.length})
                    </Button>
                    <span style={{ marginLeft: 8 }}>
                        {selectedRowKeys.length > 0 ? `Đã chọn ${selectedRowKeys.length} mục` : ''}
                    </span>
                </div>
                {error && <Alert message="Lỗi" description={error} type="error" showIcon style={{ marginBottom: 16 }} />}
                <Table
                    rowSelection={rowSelection}
                    columns={columns}
                    dataSource={subordinates}
                    loading={loading}
                    rowKey="id"
                    bordered
                />
            </Card>
        </Space>
    );
};

export default ManagerKpiDashboard;