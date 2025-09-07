// src/pages/EmployeePage.js
import React, { useState } from 'react';
import { Card, Table, Button, Input, Select, Space, Modal, Form, Popconfirm, Row, Col, Tooltip, message, Tag, Typography } from 'antd';
import {
    PlusOutlined,  EditOutlined, DeleteOutlined, ReloadOutlined
} from '@ant-design/icons';
import { useEmployees } from '../hooks/useEmployees';
import { useEmployeeFilters } from '../hooks/useEmployeeFilters'; // Hook lấy dữ liệu cho bộ lọc

const { Option } = Select;
const { Title } = Typography;

const EmployeePage = () => {
    // --- State & Hooks ---
    const [filters, setFilters] = useState({});
    const { employees, pagination, loading, setPagination, addEmployee, editEmployee, removeEmployee, refetch } = useEmployees(filters);
    const { companies, departments, loadingFilters } = useEmployeeFilters();

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState(null);
    const [form] = Form.useForm();

    // --- Xử lý sự kiện ---
    const handleTableChange = (pager, _, sorter) => {
        setPagination(p => ({ ...p, page: pager.current, limit: pager.pageSize }));
        // Thêm logic cho sorter nếu backend hỗ trợ
    };

    const handleFilterChange = (key, value) => {
        setPagination(p => ({ ...p, page: 1 }));
        setFilters(f => ({ ...f, [key]: value || undefined }));
    };

    const resetFilters = () => {
        setPagination(p => ({ ...p, page: 1 }));
        setFilters({});
    };

    const showModal = (employee = null) => {
        setEditingEmployee(employee);
        // Nếu là chỉnh sửa, set giá trị cho form. Nếu là thêm mới, reset form
        form.setFieldsValue(employee ? {
            ...employee
        } : {
            status: 'Đang làm việc', // Giá trị mặc định khi thêm mới
        });
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setEditingEmployee(null);
        form.resetFields();
    };

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            const actionPromise = editingEmployee
                ? editEmployee(editingEmployee.id, values)
                : addEmployee(values);
            
            await actionPromise;
            handleCancel(); // Chỉ đóng modal khi hành động thành công
        } catch (info) {
            console.log('Validate Failed:', info);
            message.warn('Vui lòng kiểm tra lại các trường dữ liệu.');
        }
    };

    // --- Cấu trúc cột cho bảng ---
    const columns = [
        { title: 'STT', key: 'stt', align: 'center', width: 60, render: (_, record, index) => ((pagination.page - 1) * pagination.limit) + index + 1 },
        { title: 'Mã NV', dataIndex: 'employee_code', key: 'employee_code', sorter: true },
        { title: 'Họ và Tên', dataIndex: 'full_name', key: 'full_name', sorter: true },
        { title: 'Chức vụ', dataIndex: 'position_name', key: 'position_name' },
        { title: 'Phòng ban', dataIndex: 'department_name', key: 'department_name' },
        { title: 'Email', dataIndex: 'email', key: 'email' },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => <Tag color={status === 'Đang làm việc' ? 'success' : 'error'}>{status}</Tag>
        },
        {
            title: 'Hành động',
            key: 'action',
            align: 'center',
            width: 120,
            render: (_, record) => (
                <Space>
                    <Tooltip title="Chỉnh sửa">
                        <Button type="link" icon={<EditOutlined />} onClick={() => showModal(record)} />
                    </Tooltip>
                    <Tooltip title="Nghỉ việc">
                        <Popconfirm
                            title="Bạn chắc chắn muốn cho nhân viên này nghỉ việc?"
                            onConfirm={() => removeEmployee(record.id)}
                            okText="Đồng ý"
                            cancelText="Hủy"
                        >
                            <Button type="link" icon={<DeleteOutlined />} danger />
                        </Popconfirm>
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <Card bordered={false}>
            <Title level={4}>Quản lý Nhân viên</Title>

            <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
                <Col>
                    <Space wrap>
                        <Input.Search
                            placeholder="Tìm theo tên, mã NV, email..."
                            onSearch={value => handleFilterChange('searchTerm', value)}
                            style={{ width: 250 }}
                            allowClear
                        />
                        <Select placeholder="Lọc theo công ty" style={{ width: 200 }} onChange={value => handleFilterChange('companyId', value)} allowClear loading={loadingFilters}>
                            {companies.map(c => <Option key={c.id} value={c.id}>{c.company_name}</Option>)}
                        </Select>
                        <Select placeholder="Lọc theo phòng ban" style={{ width: 200 }} onChange={value => handleFilterChange('departmentId', value)} allowClear loading={loadingFilters}>
                            {departments.map(d => <Option key={d.id} value={d.id}>{d.department_name}</Option>)}
                        </Select>
                        <Select placeholder="Lọc theo trạng thái" style={{ width: 150 }} onChange={value => handleFilterChange('status', value)} allowClear>
                            <Option value="Đang làm việc">Đang làm việc</Option>
                            <Option value="Đã nghỉ việc">Đã nghỉ việc</Option>
                        </Select>
                        <Button onClick={resetFilters}>Reset</Button>
                    </Space>
                </Col>
                <Col>
                    <Space>
                        <Button icon={<ReloadOutlined />} onClick={refetch} loading={loading}>Tải lại</Button>
                        <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>Thêm mới</Button>
                    </Space>
                </Col>
            </Row>

            <Table
                columns={columns}
                dataSource={employees}
                loading={loading}
                rowKey="id"
                bordered
                pagination={{
                    current: pagination.page,
                    pageSize: pagination.limit,
                    total: pagination.totalItems,
                    showSizeChanger: true,
                    showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} mục`,
                }}
                onChange={handleTableChange}
                scroll={{ x: 'max-content' }}
            />

            <Modal
                title={editingEmployee ? "Chỉnh sửa Thông tin Nhân viên" : "Thêm mới Nhân viên"}
                open={isModalVisible} // 'open' thay cho 'visible' ở AntD v5
                onOk={handleOk}
                onCancel={handleCancel}
                okText="Lưu"
                cancelText="Hủy"
                destroyOnClose // Reset form mỗi khi đóng
            >
                <Form form={form} layout="vertical" name="employee_form">
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="full_name" label="Họ và Tên" rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}>
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="employee_code" label="Mã nhân viên" rules={[{ required: true, message: 'Vui lòng nhập mã NV!' }]}>
                                <Input />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Email không hợp lệ!' }]}>
                        <Input />
                    </Form.Item>
                    <Row gutter={16}>
                        <Col span={12}>
                             <Form.Item name="company_id" label="Công ty" rules={[{ required: true, message: 'Vui lòng chọn công ty!' }]}>
                                <Select placeholder="Chọn công ty" loading={loadingFilters}>
                                    {companies.map(c => <Option key={c.id} value={c.id}>{c.company_name}</Option>)}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="department_id" label="Phòng ban" rules={[{ required: true, message: 'Vui lòng chọn phòng ban!' }]}>
                                <Select placeholder="Chọn phòng ban" loading={loadingFilters}>
                                     {departments.map(d => <Option key={d.id} value={d.id}>{d.department_name}</Option>)}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item name="status" label="Trạng thái" initialValue="Đang làm việc" rules={[{ required: true }]}>
                        <Select>
                            <Option value="Đang làm việc">Đang làm việc</Option>
                            <Option value="Đã nghỉ việc">Đã nghỉ việc</Option>
                            <Option value="Tạm nghỉ">Tạm nghỉ</Option>
                        </Select>
                    </Form.Item>
                    {/* Bổ sung các trường thông tin khác của nhân viên tại đây */}
                </Form>
            </Modal>
        </Card>
    );
};

export default EmployeePage;