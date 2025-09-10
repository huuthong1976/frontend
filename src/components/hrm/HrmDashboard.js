// src/components/hrm/HrmDashboard.js

import React, { useState, useEffect, useCallback } from 'react';
import { Table, Input, Select, Button, Space, Tag, Popconfirm, Tooltip, Modal, Card, notification } from 'antd';
import { PlusOutlined, EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../../context/AuthContext';
import EmployeeForm from './EmployeeForm';

const { Option } = Select;

const HrmDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [companies, setCompanies] = useState([]);
    const [filters, setFilters] = useState({ searchTerm: '', companyId: null });
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState(null);

    const isAdmin = user?.role === 'Admin';

    
    // CẢI TIẾN: Gửi tham số lọc và tìm kiếm lên backend
    const fetchEmployees = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/employees', { params: filters });
            setEmployees(res.data.data || []);
        } catch (err) {
            notification.error({ message: 'Không thể tải danh sách nhân viên.' });
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchEmployees();
    }, [fetchEmployees]);
    
    // Tải danh sách công ty cho bộ lọc
    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const res = await api.get('/employees/data-for-form');
                setCompanies(Array.isArray(res.data?.companies) ? res.data.companies : []);
            } catch (err) {
                console.error("Lỗi tải danh sách đơn vị:", err);
            }
        };
        fetchCompanies();
    }, []);

    const handleFormSuccess = () => {
        setIsFormOpen(false);
        setEditingEmployee(null);
        fetchEmployees(); // Tải lại danh sách
    };

    const showForm = (employee = null) => {
        setEditingEmployee(employee);
        setIsFormOpen(true);
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/employees/${id}`);
            notification.success({ message: 'Xóa nhân sự thành công!' });
            fetchEmployees();
        } catch (error) {
            notification.error({ message: 'Lỗi khi xóa nhân sự' });
        }
    };
    
    // CẢI TIẾN: Dùng columns của antd Table
    const columns = [
        { title: 'Mã NV', dataIndex: 'employee_code', key: 'employee_code' },
        { title: 'Họ và Tên', dataIndex: 'full_name', key: 'full_name' },
        { title: 'Phòng ban', dataIndex: 'department_name', key: 'department_name', render: text => text || 'N/A' },
        { title: 'Chức vụ', dataIndex: 'position_name', key: 'position_name', render: text => text || 'N/A' },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            align: 'center',
            render: status => <Tag color={status === 'Đang làm việc' ? 'success' : 'default'}>{status}</Tag>
        },
        {
            title: 'Hành động',
            key: 'action',
            align: 'center',
            render: (_, record) => (
                <Space size="middle">
                    <Tooltip title="Xem chi tiết">
                        <Button type="text" icon={<EyeOutlined />} onClick={() => navigate(`/hrm/employees/${record.id}`)} />
                    </Tooltip>
                    {isAdmin && (
                        <>
                            <Tooltip title="Chỉnh sửa">
                                <Button type="text" icon={<EditOutlined style={{ color: 'orange' }} />} onClick={() => showForm(record)} />
                            </Tooltip>
                            <Tooltip title="Xóa">
                                <Popconfirm
                                    title="Bạn có chắc muốn xóa?"
                                    onConfirm={() => handleDelete(record.id)}
                                    okText="Xóa"
                                    cancelText="Hủy"
                                >
                                    <Button type="text" danger icon={<DeleteOutlined />} />
                                </Popconfirm>
                            </Tooltip>
                        </>
                    )}
                </Space>
            )
        }
    ];

    return (
        <div style={{ padding: 24 }}>
            <Card title="Quản lý Nhân sự" extra={isAdmin && <Button type="primary" icon={<PlusOutlined />} onClick={() => showForm()}>Thêm nhân viên</Button>}>
                <Space style={{ marginBottom: 16 }}>
                    <Input.Search
                        placeholder="Tìm theo tên hoặc mã..."
                        onSearch={value => setFilters(f => ({ ...f, searchTerm: value }))}
                        allowClear
                        style={{ width: 300 }}
                    />
                    <Select
                        placeholder="Lọc theo đơn vị"
                        style={{ width: 200 }}
                        allowClear
                        onChange={(value) => setFilters(prevFilters => ({ ...prevFilters, companyId: value }))}
                    >
                         {companies.map(c => <Select.Option key={c.id} value={c.id}>{c.company_name}</Select.Option>)}
                    </Select>
                </Space>
                
                <Table
                    columns={columns}
                    dataSource={employees}
                    rowKey="id"
                    loading={loading}
                    bordered
                />
            </Card>

            <Modal
                title={editingEmployee ? "Cập nhật nhân sự" : "Thêm mới nhân sự"}
                open={isFormOpen}
                onCancel={() => { setIsFormOpen(false); setEditingEmployee(null); }}
                footer={null}
                destroyOnClose
            >
                <EmployeeForm
                    employee={editingEmployee}
                    onSuccess={handleFormSuccess}
                    onClose={() => { setIsFormOpen(false); setEditingEmployee(null); }}
                />
            </Modal>
        </div>
    );
};

export default HrmDashboard;
