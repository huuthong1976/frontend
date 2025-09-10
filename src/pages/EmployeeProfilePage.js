/* ========================================================= */
/* FILE: src/pages/EmployeeProfilePage.js (Đã hoàn thiện)    */
/* ========================================================= */
import React, { useState, useEffect, useCallback, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import AuthContext from '../../context/AuthContext';
import EmployeeForm from './EmployeeForm';
import { Card, Descriptions, Tabs, Spin, Alert, Typography, Button, Space, Avatar, Tag } from 'antd';
import { UserOutlined, EditOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import './HrmStyle.css'; // Import file CSS chung

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const EmployeeProfilePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditFormOpen, setIsEditFormOpen] = useState(false);

    const isAdmin = user?.role === 'Admin' || user?.role === 'NhanSu';

    const fetchProfile = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get(`/hrm/employees/${id}/profile`);
            setProfileData(res.data);
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.msg || "Không thể tải hồ sơ nhân viên.");
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

    if (loading) return <div style={{ padding: '24px' }}><Spin size="large" tip="Đang tải..." /></div>;
    if (!profileData) return <div style={{ padding: '24px' }}><Alert message="Không tìm thấy nhân viên." type="error" /></div>;

    const { profile, contracts, decisions } = profileData;

    const profileStatus = profile.status === 'Đang làm việc' ? 'success' : 'error';

    // ✅ Bổ sung các thông tin khác từ bảng employees
    const personalInfo = [
        { label: 'Mã nhân viên', content: profile.employee_code },
        { label: 'Họ và tên', content: profile.full_name },
        { label: 'Giới tính', content: profile.gender || 'N/A' },
        { label: 'Ngày sinh', content: profile.dob ? new Date(profile.dob).toLocaleDateString('vi-VN') : 'N/A' },
        { label: 'Email', content: profile.email || 'N/A' },
        { label: 'Điện thoại', content: profile.phone || 'N/A' },
        { label: 'Đơn vị', content: profile.company_name || 'N/A' },
        { label: 'Phòng ban', content: profile.department_name || 'N/A' },
        { label: 'Chức vụ', content: profile.position_name || 'N/A' },
        { label: 'Trạng thái', content: <Tag color={profileStatus}>{profile.status}</Tag> },
        { label: 'Ngày bắt đầu', content: profile.start_date ? new Date(profile.start_date).toLocaleDateString('vi-VN') : 'N/A' },
        { label: 'Vai trò', content: profile.role || 'N/A' },
    ];

    const salaryInfo = [
        { label: 'Tổng lương', content: profile.total_salary ? `${parseFloat(profile.total_salary).toLocaleString('vi-VN')} VNĐ` : 'N/A' },
        { label: 'Lương đóng BH', content: profile.base_salary_for_insurance ? `${parseFloat(profile.base_salary_for_insurance).toLocaleString('vi-VN')} VNĐ` : 'N/A' },
        { label: 'Lương KPI cơ bản', content: profile.performance_salary_base ? `${parseFloat(profile.performance_salary_base).toLocaleString('vi-VN')} VNĐ` : 'N/A' },
        { label: 'Lương P2', content: profile.p2_salary ? `${parseFloat(profile.p2_salary).toLocaleString('vi-VN')} VNĐ` : 'N/A' },
        { label: 'Số người phụ thuộc', content: profile.num_dependents || 0 },
        { label: 'Phí công đoàn', content: profile.union_fee ? `${parseFloat(profile.union_fee).toLocaleString('vi-VN')} VNĐ` : 'N/A' },
    ];

    return (
        <div className="hrm-page-container">
            <Card className="profile-header-card" style={{ marginBottom: 24 }}>
                <Space size="large" className="profile-header-space">
                    <Avatar size={100} icon={<UserOutlined />} src={profile.avatar_url} />
                    <div className="profile-header-info">
                        <Title level={4} style={{ margin: 0 }}>{profile.full_name}</Title>
                        <Text type="secondary">{profile.employee_code}</Text>
                        <p style={{ margin: '8px 0 0' }}>{profile.position_name || 'Chưa có chức vụ'}</p>
                    </div>
                </Space>
                <div className="profile-actions">
                    <Button onClick={() => navigate(-1)} icon={<ArrowLeftOutlined />}>Quay lại</Button>
                    {isAdmin && (
                        <Button type="primary" onClick={() => setIsEditFormOpen(true)} icon={<EditOutlined />}>Sửa hồ sơ</Button>
                    )}
                </div>
            </Card>

            <Card>
                <Tabs defaultActiveKey="1">
                    <TabPane tab="Thông tin chung" key="1">
                        <Title level={5}>Thông tin cá nhân & Công việc</Title>
                        <Descriptions bordered column={2}>
                            {personalInfo.map((item, index) => (
                                <Descriptions.Item label={item.label} key={index}>
                                    {item.content}
                                </Descriptions.Item>
                            ))}
                        </Descriptions>
                        <Title level={5} style={{ marginTop: 24 }}>Thông tin Lương</Title>
                        <Descriptions bordered column={2}>
                            {salaryInfo.map((item, index) => (
                                <Descriptions.Item label={item.label} key={index}>
                                    {item.content}
                                </Descriptions.Item>
                            ))}
                        </Descriptions>
                    </TabPane>
                    <TabPane tab="Hợp đồng" key="2">
                        {contracts && contracts.length > 0 ? (
                            <table className="hrm-table">
                                {/*... (giữ nguyên bảng hợp đồng) ...*/}
                            </table>
                        ) : (
                            <p>Chưa có dữ liệu hợp đồng.</p>
                        )}
                    </TabPane>
                    <TabPane tab="Quyết định" key="3">
                        {decisions && decisions.length > 0 ? (
                            <table className="hrm-table">
                                {/*... (giữ nguyên bảng quyết định) ...*/}
                            </table>
                        ) : (
                            <p>Chưa có dữ liệu quyết định.</p>
                        )}
                    </TabPane>
                </Tabs>
            </Card>
            
            {isEditFormOpen && (
                <div className="modal-backdrop">
                    <EmployeeForm
                        employee={profile}
                        onSuccess={handleEditSuccess}
                        onClose={() => setIsEditFormOpen(false)}
                    />
                </div>
            )}
        </div>
    );
};

export default EmployeeProfilePage;
