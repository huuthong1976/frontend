// src/components/auth/LoginPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './LoginPage.css';

const LoginPage = () => {
  const [identifier, setIdentifier] = useState(''); // username hoặc email
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // 👈 thêm
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const result = await login(identifier, password); // login(identifier/email, password)
      if (result?.success) navigate('/dashboard');
      else setError(result?.error || 'Đăng nhập thất bại');
    } catch (err) {
      setError(err?.message || 'Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Đăng nhập</h2>
        {error && <p className="error-message">{error}</p>}

        <div className="input-group">
          <label htmlFor="identifier">Tên đăng nhập hoặc Email</label>
          <input
            id="identifier"
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value.trim())}
            placeholder="vd: admin hoặc admin@example.com"
            autoComplete="username"
            required
          />
        </div>

        <div className="input-group">
          <label htmlFor="password">Mật khẩu</label>

          <div className="password-wrapper">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}   // 👈 chuyển kiểu
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />

            <button
              type="button"
              className="toggle-eye"
              aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              onClick={() => setShowPassword((s) => !s)}
              tabIndex={0}
            >
              {/* Eye / Eye-off SVG, không cần lib */}
              {showPassword ? (
                // eye-off
                <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                  <path fill="currentColor" d="M2.1 3.51 3.51 2.1 21.9 20.49 20.49 21.9l-3.07-3.07A11.5 11.5 0 0 1 12 20C6.73 20 2.23 16.64 1 12c.45-1.7 1.4-3.26 2.7-4.56l-1.6-1.6ZM12 6c5.27 0 9.77 3.36 11 8-.37 1.4-1.03 2.69-1.92 3.79l-2.17-2.17a6 6 0 0 0-8.53-8.53L7.4 5.64A11.49 11.49 0 0 1 12 6Zm0 3a3 3 0 0 1 3 3c0 .46-.11.9-.3 1.28L11.72 10.3c.38-.19.82-.3 1.28-.3Zm-3 3c0-.46.11-.9.3-1.28l2.98 2.98c-.38.19-.82.3-1.28.3a3 3 0 0 1-3-3Z"/>
                </svg>
              ) : (
                // eye
                <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                  <path fill="currentColor" d="M12 5c5.27 0 9.77 3.36 11 8-1.23 4.64-5.73 8-11 8S2.23 17.64 1 13c1.23-4.64 5.73-8 11-8Zm0 2C7.82 7 4.25 9.59 3.13 13 4.25 16.41 7.82 19 12 19s7.75-2.59 8.87-6C19.75 9.59 16.18 7 12 7Zm0 2.5A3.5 3.5 0 1 1 8.5 13 3.5 3.5 0 0 1 12 9.5Z"/>
                </svg>
              )}
            </button>
          </div>
        </div>

        <button type="submit" className="login-btn" disabled={submitting}>
          {submitting ? 'Đang đăng nhập…' : 'Đăng nhập'}
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
