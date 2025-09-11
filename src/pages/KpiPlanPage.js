import React, { useReducer, useMemo, useState, useEffect, useCallback } from 'react';
import {
    Card, Table, Button, Modal, Form, Input, Popconfirm, Space, Tooltip,
    Typography, Tag, Row, Col, Statistic, Divider, InputNumber, Timeline, message, Alert, DatePicker, Spin
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SendOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import dayjs from 'dayjs';
import KpiPlanCreator from './KpiPlanCreator';
import api from '../utils/api';

const { Title, Text, Paragraph } = Typography;

const kpiPlanReducer = (state, action) => {
    switch (action.type) {
        case 'SET_PLAN':
            return { ...state, plan: action.payload, loading: false };
        case 'UPDATE_ITEM': {
            if (!state.plan) return state;
            const updatedItems = state.plan.items.map(item =>
                item.id === action.payload.id ? { ...item, ...action.payload.changes } : item
            );
            return { ...state, plan: { ...state.plan, items: updatedItems } };
        }
        case 'SET_LOADING':
            return { ...state, loading: action.payload };
        default:
            return state;
    }
};

const getKpiClassification = (score) => {
    const numericScore = parseFloat(score);
    if (numericScore >= 95) return { text: 'Xuất sắc', color: '#52c41a' }; // green
    if (numericScore >= 90) return { text: 'Giỏi', color: '#13c2c2' };    // cyan
    if (numericScore >= 80) return { text: 'Khá', color: '#1890ff' };     // blue
    if (numericScore >= 70) return { text: 'TB', color: '#fa8c16' };       // orange
    if (numericScore >= 60) return { text: 'Yếu', color: '#faad14' };      // gold
    return { text: 'Chưa đạt', color: '#f5222d' }; // red
};

const KpiPlanPage = () => {
    const { user: currentUser } = useAuth();
    const location = useLocation();
    const navigatedState = location.state;

    const [state, dispatch] = useReducer(kpiPlanReducer, {
        plan: null,
        loading: true,
    });
    const { plan, loading } = state;

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [form] = Form.useForm();

    const getInitialDate = useCallback(() => {
        if (navigatedState?.year && navigatedState?.month) {
            return dayjs().year(navigatedState.year).month(navigatedState.month - 1);
        }
        return dayjs();
    }, [navigatedState]);

    const [selectedDate, setSelectedDate] = useState(getInitialDate());

    const shouldShowDatePicker = !navigatedState;

    const fetchPlan = useCallback(async (date) => {
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            const month = date.month() + 1;
            const year = date.year();
            const res = await api.get(`/kpi/my-plan?month=${month}&year=${year}`);

            // Kiểm tra nếu API trả về thông báo không tìm thấy kế hoạch
            if (res.data && res.data.message === "No plan found for this period.") {
                dispatch({ type: 'SET_PLAN', payload: null });
            } else {
                dispatch({ type: 'SET_PLAN', payload: res.data || null });
            }
        } catch (err) {
            // Nếu API trả về lỗi 404 cũng có nghĩa là không có plan
            if (err.response && err.response.status === 404) {
                 dispatch({ type: 'SET_PLAN', payload: null });
            } else {
                message.error("Lỗi khi tải kế hoạch KPI.");
                dispatch({ type: 'SET_PLAN', payload: null });
            }
        }
    }, []);

    useEffect(() => {
        fetchPlan(selectedDate);
    }, [fetchPlan, selectedDate]);

    const updateKpiItem = (id, changes) => {
        dispatch({ type: 'UPDATE_ITEM', payload: { id, changes } });
    };

    const scoreData = useMemo(() => {
        if (!plan || !plan.items || !Array.isArray(plan.items)) {
            return { totalWeight: 0, finalScore: 0, totalSelfScore: 0, totalManagerScore: 0, totalDirectorScore: 0 };
        }
        const isManagerRole = currentUser?.role === 'TruongDonVi';
        const totals = plan.items.reduce((acc, item) => {
            const weight = Number(item.weight) || 0;
            const selfScore = (Number(item.self_score) || 0) * 10;
            const managerScore = (Number(item.manager_score) || 0) * 10;
            const directorScore = (Number(item.director_score) || 0) * 10;
            let definitiveScore = 0;
            if (isManagerRole) {
                definitiveScore = (managerScore * 0.3) + (directorScore * 0.7);
            } else {
                definitiveScore = (selfScore * 0.3) + (managerScore * 0.4) + (directorScore * 0.3);
            }
            acc.totalWeight += weight;
            acc.totalSelfScore += (selfScore * weight) / 100;
            acc.totalManagerScore += (managerScore * weight) / 100;
            acc.totalDirectorScore += (directorScore * weight) / 100;
            acc.finalScore += (definitiveScore * weight) / 100;
            return acc;
        }, { totalWeight: 0, finalScore: 0, totalSelfScore: 0, totalManagerScore: 0, totalDirectorScore: 0 });
        return {
            totalWeight: totals.totalWeight,
            finalScore: totals.finalScore.toFixed(2),
            totalSelfScore: totals.totalSelfScore.toFixed(2),
            totalManagerScore: totals.totalManagerScore.toFixed(2),
            totalDirectorScore: totals.totalDirectorScore.toFixed(2),
        };
    }, [plan?.items, currentUser?.role]);

    const permissions = useMemo(() => {
        if (!plan) return {};
        const isOwner = currentUser?.id === plan.employee_id;
        const managerRole = ['TruongDonVi'];
        const ceoRole = ['TongGiamDoc', 'Admin'];
        return {
            canSelfAssess: isOwner && plan.status === 'Mới tạo',
            canManagerAssess: managerRole.includes(currentUser?.role) && plan.status === 'Chờ TĐV chấm',
            canDirectorAssess: ceoRole.includes(currentUser?.role) && plan.status === 'Chờ TGĐ chấm',
            canEditPlan: isOwner && plan.status === 'Mới tạo',
        };
    }, [plan, currentUser]);
    
    // Các hàm xử lý (showModal, handleCancelModal, etc.) giữ nguyên
    const showModal = (item = null) => {
        setEditingItem(item);
        form.setFieldsValue(item || { weight: 10 });
        setIsModalVisible(true);
      };

    const handleCancelModal = () => {
        setIsModalVisible(false);
    };

    const handleOkModal = async () => {
        try {
            const values = await form.validateFields();
            if (editingItem) {
                dispatch({ type: 'UPDATE_ITEM', payload: { id: editingItem.id, changes: values } });
            } else {
                dispatch({ type: 'ADD_ITEM', payload: values });
            }
            handleCancelModal();
        } catch (info) {
            console.log('Validate Failed:', info);
        }
    };

    const handleDeleteItem = async (itemId) => {
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            await api.delete(`/kpi/my-plan/${itemId}`);
            message.success('Xóa công việc thành công!');
            fetchPlan();
        } catch (err) {
            message.error(err.response?.data?.error || 'Xóa thất bại.');
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };

    const handleSubmitAssessment = async () => {
        if (!window.confirm('Bạn chắc chắn muốn nộp kết quả đánh giá ở bước này?')) {
            return;
        }
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            const response = await api.post(`/kpi/my-plan/submit-assessment`, {
                planId: plan.id, 
                items: plan.items,
                userRole: currentUser.role
            });

            message.success(response.data.message || 'Nộp đánh giá thành công!');
            fetchPlan();
        } catch (err) {
            console.error("Lỗi khi nộp đánh giá:", err);
            message.error(err.response?.data?.error || 'Nộp đánh giá thất bại.');
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };

    const columns = [
        { title: 'STT', key: 'stt', width: '3%', render: (_, __, index) => index + 1, align: 'center' },
        { title: 'Nội dung công việc', dataIndex: 'name', key: 'name', width: '30%' },
        { title: 'Trọng số (%)', dataIndex: 'weight', key: 'weight', width: '10%', render: (text) => `${text}%`, align: 'center' },
        { title: 'Tự chấm', dataIndex: 'self_score', width: '10%', render: (text, record) => (<InputNumber style={{ width: '100%' }} value={text} onChange={(value) => updateKpiItem(record.id, { self_score: value })} disabled={!permissions.canSelfAssess} min={0} max={10} />), align: 'center' },
        { title: 'QL chấm', dataIndex: 'manager_score', width: '10%', render: (text, record) => (<InputNumber style={{ width: '100%' }} value={text} onChange={(value) => updateKpiItem(record.id, { manager_score: value })} disabled={!permissions.canManagerAssess} min={0} max={10} />), align: 'center' },
        { title: 'TGĐ chấm', dataIndex: 'director_score', width: '10%', render: (text, record) => (<InputNumber style={{ width: '100%' }} value={text} onChange={(value) => updateKpiItem(record.id, { director_score: value })} disabled={!permissions.canDirectorAssess} min={0} max={10} />), align: 'center' },
        {
            title: 'Kết quả', key: 'result', width: '10%', align: 'center', render: (_, record) => {
                const weight = Number(record.weight) || 0;
                const selfScore = (Number(record.self_score) || 0) * 10;
                const managerScore = (Number(record.manager_score) || 0) * 10;
                const directorScore = (Number(record.director_score) || 0) * 10;
                const isManagerRole = currentUser?.role === 'TruongDonVi';
                let definitiveScore = 0;
                if (isManagerRole) {
                    definitiveScore = (managerScore * 0.3) + (directorScore * 0.7);
                } else {
                    definitiveScore = (selfScore * 0.3) + (managerScore * 0.4) + (directorScore * 0.3);
                }
                const result = (definitiveScore * weight) / 100;
                return <Text strong style={{ color: '#1890ff' }}>{result.toFixed(2)}</Text>;
            }
        },
        {
            title: 'Hành động', key: 'action', width: '9%', align: 'center', render: (_, record) => (
                <Space>
                    <Tooltip title="Sửa"><Button type="link" icon={<EditOutlined />} onClick={() => showModal(record)} disabled={!permissions.canEditPlan} /></Tooltip>
                    <Popconfirm title="Chắc chắn xóa?" onConfirm={() => handleDeleteItem(record.id)} okText="Xóa" cancelText="Hủy">
                        <Tooltip title="Xóa"><Button type="link" icon={<DeleteOutlined />} danger disabled={!permissions.canEditPlan} /></Tooltip>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const renderContent = () => {
        if (loading) {
            return <div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" /></div>;
        }
        if (!plan) {
            if (shouldShowDatePicker) {
                return <KpiPlanCreator month={selectedDate.month() + 1} year={selectedDate.year()} onCreationSuccess={() => fetchPlan(selectedDate)} />;
            }
            return <Alert message="Nhân viên này chưa có kế hoạch KPI cho kỳ đánh giá đã chọn." type="info" showIcon />;
        }

        const classification = getKpiClassification(scoreData.finalScore);
        //const centeredTitle = (text) => <div style={{ textAlign: 'center' }}>{text}</div>;
        //const boldValue = { fontWeight: 'bold' };
        return (
            <>
                <Card bordered={false}>
                    <Row justify="space-between" align="middle">
                        <Col><Title level={4}>Chi tiết Kế hoạch & Đánh giá KPI của {plan.employee_name || ''}</Title></Col>
                        <Col>
                            {/* ✅ THAY ĐỔI: Dùng Space và Divider để tạo vách ngăn */}
                            <Space size={48} split={<Divider type="vertical" style={{ height: 60 }} />}>
                                <Statistic
                                    title="Xếp loại"
                                    value={classification.text}
                                    valueStyle={{ color: classification.color }}
                                />
                                <Statistic
                                    title="Điểm KPI Tổng hợp"
                                    value={scoreData.finalScore}
                                    suffix="/ 100"
                                    precision={2}
                                />
                            </Space>
                        </Col>
                    </Row>
                </Card>

                <Row gutter={24} style={{ marginTop: '24px' }}>
                    <Col xs={24} lg={18}>
                        <Card>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                <Title level={5} style={{ margin: 0 }}>
                                    Danh sách công việc
                                    <Text type="secondary" style={{ marginLeft: 8 }}>
                                        (Tổng trọng số: <Text type={scoreData.totalWeight !== 100 ? 'danger' : 'success'}>{scoreData.totalWeight}%</Text>)
                                    </Text>
                                </Title>
                                {permissions.canEditPlan && (<Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>Thêm công việc</Button>)}
                            </div>
                            <Table
                                columns={columns}
                                dataSource={plan.items}
                                rowKey="id"
                                pagination={false}
                                bordered
                                summary={() => (
                                    <Table.Summary.Row style={{ backgroundColor: '#fafafa', textAlign: 'center' }}>
                                      <Table.Summary.Cell index={0} colSpan={2}><Text strong>Tổng hợp điểm</Text></Table.Summary.Cell>
                                      <Table.Summary.Cell index={1}><Text strong>{scoreData.totalWeight}%</Text></Table.Summary.Cell>
                                      <Table.Summary.Cell index={2}><Text strong>{scoreData.totalSelfScore}</Text></Table.Summary.Cell>
                                      <Table.Summary.Cell index={3}><Text strong>{scoreData.totalManagerScore}</Text></Table.Summary.Cell>
                                      <Table.Summary.Cell index={4}><Text strong>{scoreData.totalDirectorScore}</Text></Table.Summary.Cell>
                                      <Table.Summary.Cell index={5} colSpan={2}><Text strong type="danger" style={{fontSize: '1.1em'}}>{scoreData.finalScore}</Text></Table.Summary.Cell>
                                    </Table.Summary.Row>
                                )}
                            />
                        </Card>
                    </Col>
                    <Col xs={20} lg={6}>
                        <Card>
                             <Title level={5}>Thông tin & Hành động</Title>
                            <Paragraph><strong>Kỳ đánh giá:</strong> Tháng {plan.month}/{plan.year}</Paragraph>
                            <Paragraph><strong>Trạng thái:</strong> <Tag color="blue">{plan.status}</Tag></Paragraph>
                            <Divider />
                            <Title level={5}>Lịch sử duyệt</Title>
                            <Timeline>
                                {plan.history?.length > 0 ? (
                                    plan.history.map(item => <Timeline.Item key={item.id}>{item.action}</Timeline.Item>)
                                ) : (<Timeline.Item color="gray">Chưa có lịch sử.</Timeline.Item>)}
                            </Timeline>
                            <Divider />
                            {permissions.canSelfAssess && (<Button type="primary" icon={<SendOutlined />} block loading={loading} onClick={handleSubmitAssessment}>Nộp điểm tự chấm</Button>)}
                            {permissions.canManagerAssess && (<Button type="primary" icon={<SendOutlined />} block loading={loading} onClick={handleSubmitAssessment}>QL Chấm & Chuyển TGĐ</Button>)}
                            {permissions.canDirectorAssess && (<Button type="primary" icon={<CheckCircleOutlined />} block loading={loading} onClick={handleSubmitAssessment}>TGĐ Chấm & Hoàn tất</Button>)}
                        </Card>
                    </Col>
                </Row>
                <Modal title={editingItem ? "Chỉnh sửa" : "Thêm mới công việc"} open={isModalVisible} onOk={handleOkModal} onCancel={handleCancelModal} destroyOnClose>
                    <Form form={form} layout="vertical" initialValues={{ weight: 10 }}>
                        <Form.Item name="name" label="Tên công việc" rules={[{ required: true, message: 'Vui lòng nhập tên công việc!' }]}><Input.TextArea rows={3} /></Form.Item>
                        <Form.Item name="weight" label="Trọng số (%)" rules={[{ required: true, message: 'Vui lòng nhập trọng số!' }]}><InputNumber min={0} max={100} style={{ width: '100%' }} /></Form.Item>
                    </Form>
                </Modal>
            </>
        );
    };

    return (
        <Space direction="vertical" size="large" style={{ display: 'flex' }}>
            {shouldShowDatePicker && (
                 <Card bordered={false}>
                    <Space>
                        <Text strong>Chọn kỳ đánh giá:</Text>
                        <DatePicker
                            picker="month"
                            value={selectedDate}
                            onChange={(date) => { if (date) setSelectedDate(date) }}
                        />
                    </Space>
                </Card>
            )}
            {renderContent()}
        </Space>
    );
};

export default KpiPlanPage;