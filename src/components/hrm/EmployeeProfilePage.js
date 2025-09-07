// src/components/hrm/EmployeeProfilePage.js

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Avatar, Descriptions, Tabs, Button, Spin, Modal, notification, Table, Tag } from 'antd';
import { ArrowLeftOutlined, EditOutlined } from '@ant-design/icons';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import EmployeeForm from './EmployeeForm';
import moment from 'moment';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

const EmployeeProfilePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditFormOpen, setIsEditFormOpen] = useState(false);

    const isAdmin = user?.role === 'Admin';

    const fetchProfile = useCallback(async () => {
        setLoading(true);
        try {
            // CẢI TIẾN: API nên là /employees/:id để theo chuẩn RESTful hơn
            const res = await api.get(`/employees/${id}`);
            setProfileData(res.data);
        } catch (error) {
            notification.error({ message: "Không thể tải hồ sơ nhân viên." });
            navigate('/hrm');
        } finally {
            setLoading(false);
        }
    }, [id, navigate]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const handleEditSuccess = () => {
        setIsEditFormOpen(false);
        fetchProfile();
    };

    if (loading) return <Spin size="large" style={{ display: 'block', marginTop: 50 }} />;
    if (!profileData) return <p>Không tìm thấy nhân viên.</p>;

    const { profile, contracts, decisions } = profileData;

    const contractColumns = [
        { title: 'Mã HĐ', dataIndex: 'contract_code', key: 'contract_code' },
        { title: 'Loại HĐ', dataIndex: 'contract_type', key: 'contract_type' },
        { title: 'Ngày bắt đầu', dataIndex: 'start_date', key: 'start_date', render: text => moment(text).format('DD/MM/YYYY') },
        { title: 'Ngày kết thúc', dataIndex: 'end_date', key: 'end_date', render: text => text ? moment(text).format('DD/MM/YYYY') : 'N/A' },
        { title: 'Trạng thái', dataIndex: 'status', key: 'status', render: text => <Tag>{text}</Tag> },
    ];
    
    // Bạn có thể định nghĩa columns tương tự cho 'decisions'

    return (
        <div style={{ padding: 24 }}>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} style={{ marginBottom: 16 }}>
                Quay lại
            </Button>
            
            <Card
                title="Hồ sơ nhân viên"
                extra={isAdmin && <Button type="primary" icon={<EditOutlined />} onClick={() => setIsEditFormOpen(true)}>Sửa hồ sơ</Button>}
            >
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
                    <Avatar size={100} src={profile.avatar_url ? `${API_BASE_URL}${profile.avatar_url}` : undefined} />
                    <div style={{ marginLeft: 24 }}>
                        <h2 style={{ margin: 0 }}>{profile.full_name}</h2>
                        <p>{profile.position_name || 'Chưa có chức vụ'}</p>
                        <Tag color={profile.status === 'Đang làm việc' ? 'success' : 'default'}>{profile.status}</Tag>
                    </div>
                </div>

                <Descriptions bordered column={2}>
                    <Descriptions.Item label="Mã NV">{profile.employee_code}</Descriptions.Item>
                    <Descriptions.Item label="Email">{profile.email}</Descriptions.Item>
                    <Descriptions.Item label="Đơn vị">{profile.company_name || 'N/A'}</Descriptions.Item>
                    <Descriptions.Item label="Phòng ban">{profile.department_name || 'N/A'}</Descriptions.Item>
                </Descriptions>

                <Tabs defaultActiveKey="contracts" style={{ marginTop: 24 }}>
                    <Tabs.TabPane tab="Hợp đồng" key="contracts">
                        <Table dataSource={contracts} columns={contractColumns} rowKey="id" />
                    </Tabs.TabPane>
                    <Tabs.TabPane tab="Quyết định" key="decisions">
                        <p>Dữ liệu quyết định sẽ hiển thị ở đây.</p>
                        {/* <Table dataSource={decisions} columns={...} /> */}
                    </Tabs.TabPane>
                </Tabs>
            </Card>

            <Modal
                title="Cập nhật hồ sơ"
                open={isEditFormOpen}
                onCancel={() => setIsEditFormOpen(false)}
                footer={null}
                destroyOnClose
            >
                <EmployeeForm
                    employee={profile}
                    onSuccess={handleEditSuccess}
                    onClose={() => setIsEditFormOpen(false)}
                />
            </Modal>
        </div>
    );
};

export default EmployeeProfilePage;