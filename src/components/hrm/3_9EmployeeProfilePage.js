import React, { useState, useEffect, useCallback, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import AuthContext from '../../context/AuthContext';
import EmployeeForm from './EmployeeForm';
import './HrmStyle.css'; // Import file CSS chung

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

const EmployeeProfilePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('contracts');
    const [isEditFormOpen, setIsEditFormOpen] = useState(false); // State cho modal sửa

    const isAdmin = user?.role === 'Admin';

    const fetchProfile = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get(`/hrm/employees/${id}/profile`);
            setProfileData(res.data);
        } catch (error) {
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
        setIsEditFormOpen(false); // Đóng modal
        fetchProfile(); // Tải lại dữ liệu profile
    };

    if (loading) return <div className="hrm-page-container">Đang tải...</div>;
    if (!profileData) return <div className="hrm-page-container">Không tìm thấy nhân viên.</div>;

    const { profile, contracts, decisions } = profileData; // <-- Biến contracts và decisions được sử dụng bên dưới

    return (
        <div className="hrm-page-container">
           <div className="hrm-header">
            <button className="btn-back" onClick={() => navigate(-1)}>
                <i className="fas fa-arrow-left"></i> Quay lại
            </button>
            <h1>Hồ sơ nhân viên</h1>
            {isAdmin ? (
                <button className="btn btn--primary" onClick={() => setIsEditFormOpen(true)}>
                    <i className="fas fa-pencil-alt"></i> Sửa hồ sơ
                </button>
             ) : (
            <div /> // Thêm thẻ div trống để giữ cấu trúc flexbox
            )}
        </div>
            
            <div className="profile-card">
                <div className="profile-avatar">
                    <img src={profile.avatar_url ? `${API_BASE_URL}${profile.avatar_url}` : 'https://via.placeholder.com/100'} alt="Avatar" />
                </div>
                <div className="profile-info">
                    <h2>{profile.full_name}</h2>
                    <p>{profile.position_name || 'Chưa có chức vụ'}</p>
                    <span className={`status-badge status--${profile.status === 'Đang làm việc' ? 'active' : 'inactive'}`}>
                        {profile.status}
                    </span>
                </div>
                <div className="profile-details">
                    <p><strong>Mã NV:</strong> {profile.employee_code}</p>
                    <p><strong>Email:</strong> {profile.email}</p>
                    <p><strong>Đơn vị:</strong> {profile.company_name || 'N/A'}</p>
                    <p><strong>Phòng ban:</strong> {profile.department_name || 'N/A'}</p>
                </div>
            </div>

            <div className="profile-tabs">
                <button onClick={() => setActiveTab('contracts')} className={activeTab === 'contracts' ? 'active' : ''}>Hợp đồng</button>
                <button onClick={() => setActiveTab('decisions')} className={activeTab === 'decisions' ? 'active' : ''}>Quyết định</button>
            </div>

            <div className="tab-content">
                {activeTab === 'contracts' && (
                    <>
                        <h3>Danh sách Hợp đồng</h3>
                        {contracts && contracts.length > 0 ? (
                            <table className="hrm-table">
                                <thead>
                                    <tr>
                                        <th>Mã hợp đồng</th>
                                        <th>Loại hợp đồng</th>
                                        <th>Ngày bắt đầu</th>
                                        <th>Ngày kết thúc</th>
                                        <th>Trạng thái</th>
                                        {/* Thêm các cột khác nếu cần */}
                                    </tr>
                                </thead>
                                <tbody>
                                    {contracts.map(contract => (
                                        <tr key={contract.id}>
                                            <td>{contract.contract_code}</td>
                                            <td>{contract.contract_type}</td>
                                            <td>{new Date(contract.start_date).toLocaleDateString('vi-VN')}</td>
                                            <td>{contract.end_date ? new Date(contract.end_date).toLocaleDateString('vi-VN') : 'N/A'}</td>
                                            <td>{contract.status}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p>Chưa có dữ liệu hợp đồng.</p>
                        )}
                    </>
                )}

                {activeTab === 'decisions' && (
                    <>
                        <h3>Danh sách Quyết định</h3>
                        {decisions && decisions.length > 0 ? (
                            <table className="hrm-table">
                                <thead>
                                    <tr>
                                        <th>Mã quyết định</th>
                                        <th>Loại quyết định</th>
                                        <th>Ngày hiệu lực</th>
                                        <th>Nội dung</th>
                                        {/* Thêm các cột khác nếu cần */}
                                    </tr>
                                </thead>
                                <tbody>
                                    {decisions.map(decision => (
                                        <tr key={decision.id}>
                                            <td>{decision.decision_code}</td>
                                            <td>{decision.decision_type}</td>
                                            <td>{new Date(decision.effective_date).toLocaleDateString('vi-VN')}</td>
                                            <td>{decision.content || 'N/A'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p>Chưa có dữ liệu quyết định.</p>
                        )}
                    </>
                )}
            </div>

            {isEditFormOpen && (
                <div className="modal-backdrop">
                    <EmployeeForm
                        employee={profile} // Truyền dữ liệu nhân viên hiện tại để form ở chế độ "Sửa"
                        onSuccess={handleEditSuccess}
                        onClose={() => setIsEditFormOpen(false)}
                    />
                </div>
            )}
        </div>
    );
};

export default EmployeeProfilePage;