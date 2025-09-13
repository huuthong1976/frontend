// src/pages/KpiPlanCreator.js
import React, { useState, useMemo, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Input, InputNumber, Popconfirm, Space, Tooltip, Typography, message } from 'antd';
import { PlusOutlined, DeleteOutlined, SendOutlined, EditOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api'; 
<<<<<<< HEAD
const { Title, Text } = Typography;
=======
const { Text } = Typography;
>>>>>>> f15a9d8302fa2b98bc412e4e61010564b5d3a109

const KpiPlanCreator = ({ month, year, onCreationSuccess }) => {
    const { user } = useAuth();
    const [items, setItems] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isModalVisible && editingItem) {
            form.setFieldsValue(editingItem);
        } else {
            form.resetFields();
        }
    }, [isModalVisible, editingItem, form]);

    const showModal = (item = null) => {
        setEditingItem(item);
        setIsModalVisible(true);
    };

    const handleCancelModal = () => {
        setIsModalVisible(false);
        setEditingItem(null);
        form.resetFields();
    };

    const handleOkModal = async () => {
        try {
            const values = await form.validateFields();
            if (editingItem) {
                setItems(items.map(item =>
                    item.id === editingItem.id ? { ...item, ...values } : item
                ));
                message.success('Cập nhật mục tiêu thành công!');
            } else {
                const newItem = {
                    ...values,
                    id: Date.now(),
                };
                setItems([...items, newItem]);
                message.success('Thêm mục tiêu thành công!');
            }
            handleCancelModal();
        } catch (info) {
            console.log('Validate Failed:', info);
        }
    };

    const handleDeleteItem = (id) => {
        setItems(items.filter(item => item.id !== id));
        message.success('Xóa mục tiêu thành công!');
    };

    const handleCreatePlan = async () => {
        if (items.length === 0) {
            message.warning('Vui lòng thêm ít nhất một mục tiêu.');
            return;
        }

        const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
        if (totalWeight !== 100) {
            message.error(`Tổng trọng số phải bằng 100%. Hiện tại là: ${totalWeight}%`);
            return;
        }

        setLoading(true);
        try {
            const dataToSave = {
                employee_id: user?.id,
                month,
                year,
                items: items.map(item => ({
                    name: item.name,
                    weight: item.weight,
                })),
            };
            await api.post('/kpi/my-plan', dataToSave);
            message.success('Đăng ký kế hoạch thành công!');
            onCreationSuccess();
        } catch (err) {
            message.error(err.response?.data?.error || 'Đăng ký thất bại.');
        } finally {
            setLoading(false);
        }
    };

    const columns = useMemo(() => [
        {
            title: 'STT',
            key: 'stt',
            width: 60,
            render: (_, __, index) => index + 1,
        },
        {
            title: 'Nội dung công việc',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Trọng số (%)',
            dataIndex: 'weight',
            key: 'weight',
            render: (text) => `${text}%`,
            width: 120,
        },
        {
            title: 'Hành động',
            key: 'action',
            width: 120,
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="Chỉnh sửa">
                        <Button
                            type="link"
                            icon={<EditOutlined />}
                            onClick={() => showModal(record)}
                        />
                    </Tooltip>
                    <Popconfirm
                        title="Bạn chắc chắn muốn xóa mục tiêu này?"
                        onConfirm={() => handleDeleteItem(record.id)}
                        okText="Có"
                        cancelText="Không"
                    >
                        <Tooltip title="Xóa">
                            <Button
                                type="link"
                                danger
                                icon={<DeleteOutlined />}
                            />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            ),
        },
    ], [items]);

    const totalWeight = useMemo(() => items.reduce((sum, item) => sum + item.weight, 0), [items]);

    return (
        <Card title={`Đăng ký kế hoạch KPI cho Tháng ${month}/${year}`} extra={(
            <Space>
                <Text type={totalWeight !== 100 ? 'danger' : 'secondary'} style={{ marginRight: 16 }}>
                    Tổng trọng số: {totalWeight}%
                </Text>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>Thêm mục tiêu</Button>
            </Space>
        )}>
            <Table
                dataSource={items}
                columns={columns}
                rowKey="id"
                pagination={false}
                bordered
                locale={{ emptyText: 'Chưa có mục tiêu nào được thêm. Vui lòng thêm mục tiêu!' }}
            />
            <div style={{ textAlign: 'right', marginTop: 16 }}>
                <Button
                    type="primary"
                    icon={<SendOutlined />}
                    onClick={handleCreatePlan}
                    loading={loading}
                    disabled={totalWeight !== 100 || items.length === 0}
                >
                    Nộp kế hoạch
                </Button>
            </div>

            <Modal
                title={editingItem ? "Chỉnh sửa Mục tiêu" : "Thêm mới Mục tiêu"}
                open={isModalVisible}
                onOk={handleOkModal}
                onCancel={handleCancelModal}
                destroyOnClose
            >
                <Form form={form} layout="vertical">
                    <Form.Item name="name" label="Nội dung công việc" rules={[{ required: true, message: 'Vui lòng nhập nội dung công việc' }]}>
                        <Input.TextArea rows={3} />
                    </Form.Item>
                    {/* Đã loại bỏ trường Chỉ tiêu */}
                    <Form.Item name="weight" label="Trọng số (%)" rules={[{ required: true, message: 'Vui lòng nhập trọng số' }]}>
                        <InputNumber min={1} max={100} style={{ width: '100%' }} />
                    </Form.Item>
                </Form>
            </Modal>
        </Card>
    );
};

export default KpiPlanCreator;