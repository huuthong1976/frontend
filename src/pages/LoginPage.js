import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './LoginPage.css';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(username, password);   // ném lỗi nếu sai
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err?.message || 'Đăng nhập thất bại');
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={onSubmit}>
        <h2>Đăng nhập</h2>
        {error && <p className="error-message">{error}</p>}

        <div className="input-group">
          <label htmlFor="username">Tên đăng nhập</label>
          <input id="username" value={username} onChange={(e) => setUsername(e.target.value)} autoFocus />
        </div>

        <div className="input-group">
          <label htmlFor="password">Mật khẩu</label>
          <input
            id="password"
            type={showPwd ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <span className="password-toggle-icon" onClick={() => setShowPwd(!showPwd)}>
            {showPwd ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
          </span>
        </div>

        <button type="submit" className="login-btn">Đăng nhập</button>
      </form>
    </div>
  );
}
