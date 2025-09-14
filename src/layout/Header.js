import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Space, Button } from 'antd';
import './Layout.css';

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="app-header">
      <div className="header-left" />
      <div className="header-right">
        {user ? (
          <div className="user-profile">
            <Space size="middle">
              <span>Chào, {user.full_name || user.username}!</span>
              <Button type="primary" danger onClick={handleLogout}>Đăng xuất</Button>
            </Space>
          </div>
        ) : <p>Đang tải...</p>}
      </div>
    </header>
  );
}
