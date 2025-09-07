import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

// axios instance kèm token
const api = axios.create({ baseURL: API_BASE_URL });
api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem('token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

const EditProfileModal = ({ currentUser, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    email: currentUser.email || '',
    phone: currentUser.phone || ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  // Esc để đóng + lock scroll khi mở modal
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

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/employees/${currentUser.id}/profile-details`, formData);
      setMessage({ type: 'success', text: 'Cập nhật thành công!' });
      onSuccess?.();
      setTimeout(onClose, 1200);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.msg || 'Đã xảy ra lỗi.' });
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content account-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <h2>Chỉnh sửa Thông tin</h2>
        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label>Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Số điện thoại</label>
            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} />
          </div>

          {message.text && <div className={`message ${message.type}`}>{message.text}</div>}

          <div className="separator" />
          <div className="modal-actions">
            <button type="button" className="btn" onClick={onClose}>Hủy</button>
            <button type="submit" className="btn-primary">Lưu</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;
