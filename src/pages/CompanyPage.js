// src/pages/CompanyPage.js
import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Input, Select, Popconfirm, Space, message, Tag, Tooltip, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useCompanies } from '../hooks/useCompanies';
import api from 'utils/api';

const { Option } = Select;
const { Paragraph } = Typography;
const CompanyPage = () => {
    const { addCompany, editCompany, removeCompany } = useCompanies();
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingCompany, setEditingCompany] = useState(null);
    const [form] = Form.useForm();

    useEffect(() => {
        const fetchCompanies = async () => {
          try {
            const res = await api.get('/companies');
            const rows = Array.isArray(res.data) ? res.data : (res.data?.rows || []);
            setCompanies(rows);
          } catch (error) {
            const msg = error?.response?.data?.error || error.message || 'Không thể tải danh sách đơn vị';
            console.error('Lỗi khi tải dữ liệu:', error);
            message.error(msg);
          } finally {
            setLoading(false);
          }
        };
      
        fetchCompanies();
      }, []);
      console.log('State companies hiện tại:', companies);
    const showModal = (company = null) => {
        setEditingCompany(company);
        // Bổ sung các trường mới vào giá trị ban đầu của form
        form.setFieldsValue(company ? company : { company_code: '', company_name: '', address: '', tax_code: '', phone: '', email: '', status: 'active' });
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setEditingCompany(null);
        form.resetFields();
    };

    const handleOk = () => {
        form.validateFields().then(values => {
            if (editingCompany) {
                editCompany(editingCompany.id, values);
            } else {
                addCompany(values);
            }
            handleCancel();
        });
    };

    const columns = [
        { title: 'STT', key: 'stt', align: 'center', width: 60, render: (text, record, index) => index + 1 },
        { title: 'Mã Công ty', dataIndex: 'company_code', key: 'company_code',width: 70, align: 'center', className: 'nowrap',},
        { title: 'Tên Công ty', dataIndex: 'name', key: 'name', width: 260,ellipsis: { showTitle: false }, render: (text) =>
        text ? (
          <Tooltip title={text}>
            <Paragraph style={{ margin: 0 }} ellipsis={{ rows: 2 }}>
              {text}
            </Paragraph>
          </Tooltip>
        ) : null, },
        { title: 'Địa chỉ', dataIndex: 'address', key: 'address',width: 320,
        ellipsis: { showTitle: false },
        render: (text) =>
          text ? (
            <Tooltip title={text}>
              <Paragraph style={{ margin: 0 }} ellipsis={{ rows: 2 }}>
                {text}
              </Paragraph>
            </Tooltip>
          ) : null, },
        { title: 'Mã số thuế', dataIndex: 'tax_code', key: 'tax_code',width: 140,
        align: 'center',
        ellipsis: true,
        className: 'nowrap', },
        { title: 'Điện thoại', dataIndex: 'phone', key: 'phone', width: 130,
        align: 'center',
        className: 'nowrap', },
        { title: 'Email', dataIndex: 'email', key: 'email',width: 240,
        ellipsis: { showTitle: false },
        render: (text) =>
          text ? (
            <Tooltip title={text}>
              <Paragraph style={{ margin: 0 }} ellipsis={{ rows: 1 }}>
                {text}
              </Paragraph>
            </Tooltip>
          ) : null, },
        { title: 'Trạng thái', dataIndex: 'status', key: 'status',width: 110,
        align: 'center',
        render: (s) => (
          <Tag color={s === 'active' ? 'green' : 'red'} style={{ margin: 0 }}>
            {s}
          </Tag>
        ), },
        {
            title: 'Hành động',
            key: 'action',
            align: 'center',
            width: 160,
            fixed: 'right',
            render: (_, record) => (
                <Space>
                    <Button icon={<EditOutlined />} onClick={() => showModal(record)}>Sửa</Button>
                    <Popconfirm
                        title="Bạn chắc chắn muốn xóa?"
                        onConfirm={() => removeCompany(record.id)}
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
                <h2>Danh sách các đơn vị</h2>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>
                    Thêm mới
                </Button>
            {/* SỬA LỖI: THẺ ĐÓNG </div> ĐÃ BỊ THỪA Ở ĐÂY. */}
            </div>
            
            {loading ? (
                // You can add a spinner or a loading message here
                <p>Loading data...</p>
            ) : (
                <Table
                    columns={columns}
                    dataSource={Array.isArray(companies) ? companies : []}
                    rowKey="id"
                    bordered
                    scroll={{ x: 1500 }}
                    className="companies-table" 
                />
            )}
            

            <Modal
                title={editingCompany ? "Chỉnh sửa Công ty" : "Tạo mới Công ty"}
                visible={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
                okText="Lưu"
                cancelText="Hủy"
            >
                <Form form={form} layout="vertical">
                    <Form.Item name="company_code" label="Mã công ty" rules={[{ required: true, message: 'Vui lòng nhập mã công ty!' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="company_name" label="Tên công ty" rules={[{ required: true, message: 'Vui lòng nhập tên công ty!' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="address" label="Địa chỉ">
                        <Input />
                    </Form.Item>
                    <Form.Item name="tax_code" label="Mã số thuế">
                        <Input />
                    </Form.Item>
                    <Form.Item name="phone" label="Điện thoại">
                        <Input />
                    </Form.Item>
                    <Form.Item name="email" label="Email" rules={[{ type: 'email', message: 'Email không hợp lệ!' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="status" label="Trạng thái" initialValue="active">
                        <Select>
                            <Option value="active">Đang hoạt động</Option>
                            <Option value="inactive">Không hoạt động</Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </Card>
    );
};

export default CompanyPage;