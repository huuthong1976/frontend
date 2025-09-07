import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({ baseURL: API_BASE_URL });
api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem('token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

const ChangePasswordModal = ({ onClose }) => {
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const handleChange = (e) => setPasswordData({ ...passwordData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return setMessage({ type: 'error', text: 'Mật khẩu mới không khớp.' });
    }
    try {
      const res = await api.put('/auth/change-password', passwordData);
      setMessage({ type: 'success', text: res.data.msg || 'Đổi mật khẩu thành công!' });
      setTimeout(onClose, 1200);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.msg || 'Đã xảy ra lỗi.' });
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content account-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <h2>Đổi mật khẩu</h2>
        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label>Mật khẩu hiện tại</label>
            <input type="password" name="currentPassword" onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Mật khẩu mới</label>
            <input type="password" name="newPassword" onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Xác nhận mật khẩu mới</label>
            <input type="password" name="confirmPassword" onChange={handleChange} required />
          </div>

          {message.text && <div className={`message ${message.type}`}>{message.text}</div>}

          <div className="separator" />
          <div className="modal-actions">
            <button type="button" className="btn" onClick={onClose}>Hủy</button>
            <button type="submit" className="btn-primary">Cập nhật</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
