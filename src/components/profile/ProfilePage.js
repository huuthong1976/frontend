// File: src/components/profile/ProfilePage.js (Giao diện Bảng)

import React, { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';
import './ProfilePage.css';
import EditProfileModal from './EditProfileModal';
import ChangePasswordModal from './ChangePasswordModal';

const API_BASE_URL = 'http://localhost:5000/api';

const ProfilePage = () => {
    const { user } = useContext(AuthContext);
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

    const fetchProfile = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE_URL}/hrm/employees/${user.id}/profile`);
            setProfileData(res.data.profile);
        } catch (err) {
            console.error("Lỗi tải thông tin cá nhân:", err);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);
    
    if (loading) return <div className="loading-container">Đang tải...</div>;
    if (!profileData) return <div className="loading-container">Không thể tải thông tin cá nhân.</div>;

    return (
        <div className="profile-page-container">
            <h1>Thông tin cá nhân</h1>

            <table className="profile-table">
                <tbody>
                    <tr>
                        <td>
                            <span className="info-label">Họ và tên:</span>
                            <span className="info-value">{profileData.full_name}</span>
                        </td>
                        <td>
                            <span className="info-label">Email:</span>
                            <span className="info-value">{profileData.email}</span>
                        </td>
                        <td>
                            <span className="info-label">Số điện thoại:</span>
                            <span className="info-value">{profileData.phone || 'Chưa cập nhật'}</span>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <span className="info-label">Tên đơn vị:</span>
                            <span className="info-value">{profileData.company_name || 'Chưa cập nhật'}</span>
                        </td>
                        <td>
                            <span className="info-label">Phòng ban:</span>
                            <span className="info-value">{profileData.department_name || 'Chưa cập nhật'}</span>
                        </td>
                        <td>
                            <span className="info-label">Chức vụ:</span>
                            <span className="info-value">{profileData.position_name || 'Chưa cập nhật'}</span>
                        </td>
                    </tr>
                </tbody>
            </table>

            <div className="card-actions">
                <button className="btn btn--primary" onClick={() => setIsEditModalOpen(true)}>Chỉnh sửa</button>
                <button className="btn btn--primary" onClick={() => setIsPasswordModalOpen(true)}>Đổi mật khẩu</button>
            </div>

            {isEditModalOpen && (
                <EditProfileModal 
                    currentUser={profileData}
                    onClose={() => setIsEditModalOpen(false)}
                    onSuccess={fetchProfile}
                />
            )}
            {isPasswordModalOpen && (
                <ChangePasswordModal 
                    onClose={() => setIsPasswordModalOpen(false)}
                />
            )}
        </div>
    );
};

export default ProfilePage;