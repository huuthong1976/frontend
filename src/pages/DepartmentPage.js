// src/pages/DepartmentPage.js
import React, { useState,useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Input, Select, Popconfirm, Space } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useDepartments } from '../hooks/useDepartments';
import api from '../utils/api';

const { Option } = Select;

const DepartmentPage = () => {
    const [filters] = useState({});
    const { departments, loading, addDepartment, editDepartment, removeDepartment } = useDepartments(filters);
    
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingDepartment, setEditingDepartment] = useState(null);
    const [form] = Form.useForm();
    
    // Giả lập danh sách công ty
    const [companies, setCompanies] = useState([]);
    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const res = await api.get('/companies');
                const rows = Array.isArray(res.data) ? res.data : (res.data?.rows || []);
                setCompanies(rows); 
            } catch (error) {
                console.error("Không thể tải danh sách công ty:", error);
                // Có thể thêm thông báo lỗi cho người dùng ở đây
            }
        };

        fetchCompanies();
    }, []);

    const showModal = (department = null) => {
        setEditingDepartment(department);
        form.setFieldsValue(department ? department : { company_id: null, department_name: '' });
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setEditingDepartment(null);
        form.resetFields();
    };

    const handleOk = () => {
        form.validateFields().then(values => {
            if (editingDepartment) {
                editDepartment(editingDepartment.id, values);
            } else {
                addDepartment(values);
            }
            handleCancel();
        });
    };

    const getCompanyName = (companyId) => {
        const c = (companies || []).find(x => Number(x.id) === Number(companyId));
        return c?.company_name ?? c?.name ?? 'N/A';
    };

    const columns = [
        { title: 'STT', key: 'stt', render: (text, record, index) => index + 1 },
        { title: 'Tên phòng ban', dataIndex: 'department_name', key: 'department_name' },
        { title: 'Thuộc công ty', dataIndex: 'company_id', key: 'company_id', render: (companyId) => getCompanyName(companyId) },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <Space>
                    <Button icon={<EditOutlined />} onClick={() => showModal(record)}>Sửa</Button>
                    <Popconfirm
                        title="Bạn chắc chắn muốn xóa?"
                        onConfirm={() => removeDepartment(record.id)}
                        okText="Xóa"
                        cancelText="Hủy"
                    >
                        <Button icon={<DeleteOutlined />} danger>Xóa</Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <h2>Quản lý Phòng ban</h2>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>
                    Thêm mới
                </Button>
            </div>
            
            <Table
                columns={columns}
                dataSource={departments}
                loading={loading}
                rowKey="id"
                bordered
            />

            <Modal
                title={editingDepartment ? "Chỉnh sửa Phòng ban" : "Tạo mới Phòng ban"}
                visible={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
                okText="Lưu"
                cancelText="Hủy"
            >
                <Form form={form} layout="vertical">
                    <Form.Item name="department_name" label="Tên phòng ban" rules={[{ required: true, message: 'Vui lòng nhập tên phòng ban!' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="company_id" label="Thuộc công ty" rules={[{ required: true, message: 'Vui lòng chọn công ty!' }]}>
                        <Select placeholder="Chọn công ty">
                        {(companies || []).map(c => (
                            <Option key={c.id} value={c.id} label={c.company_name ?? c.name}>
                                {c.company_name ?? c.name}
                            </Option>
                        ))}
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </Card>
    );
};

export default DepartmentPage;
