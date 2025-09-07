/* =================================================================== */
/* FILE: kpi-frontend/src/components/profile/PersonalSettingsPage.js   */
/* =================================================================== */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Profile.css';

const PersonalSettingsPage = () => {
    const [details, setDetails] = useState({ email: '', phone: '' });
    const [password, setPassword] = useState({ currentPassword: '', newPassword: '' });

    useEffect(() => {
        axios.get('http://localhost:5000/api/users/me').then(res => {
            setDetails({ email: res.data.email, phone: res.data.phone });
        });
    }, []);

    const onDetailsChange = e => setDetails({ ...details, [e.target.name]: e.target.value });
    const onPasswordChange = e => setPassword({ ...password, [e.target.name]: e.target.value });

    const handleDetailsSubmit = async e => {
        e.preventDefault();
        try {
            const res = await axios.put('http://localhost:5000/api/users/me/details', details);
            alert(res.data.msg);
        } catch (error) { alert(error.response?.data?.msg || 'Lỗi'); }
    };

    const handlePasswordSubmit = async e => {
        e.preventDefault();
        try {
            const res = await axios.put('http://localhost:5000/api/users/me/password', password);
            alert(res.data.msg + ' Vui lòng đăng nhập lại.');
            // Note: You might need to call the logout function from AuthContext here
        } catch (error) { alert(error.response?.data?.msg || 'Lỗi'); }
    };

    return (
        <div className="settings-container">
            <h1>Cài đặt Cá nhân</h1>
            <div className="settings-grid">
                <div className="settings-card">
                    <h3>Thông tin liên lạc</h3>
                    <form onSubmit={handleDetailsSubmit}>
                        <label>Email</label>
                        <input type="email" name="email" value={details.email || ''} onChange={onDetailsChange} />
                        <label>Số điện thoại</label>
                        <input type="text" name="phone" value={details.phone || ''} onChange={onDetailsChange} />
                        <button type="submit">Lưu thay đổi</button>
                    </form>
                </div>
                <div className="settings-card">
                    <h3>Đổi mật khẩu</h3>
                    <form onSubmit={handlePasswordSubmit}>
                        <label>Mật khẩu hiện tại</label>
                        <input type="password" name="currentPassword" value={password.currentPassword} onChange={onPasswordChange} required />
                        <label>Mật khẩu mới</label>
                        <input type="password" name="newPassword" value={password.newPassword} onChange={onPasswordChange} required />
                        <button type="submit">Đổi mật khẩu</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default PersonalSettingsPage;