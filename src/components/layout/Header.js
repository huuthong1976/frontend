// src/components/layout/Header.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Space, Button } from 'antd';
import './Layout.css'; 

const Header = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login'); 
    };

    return (
        <header className="app-header">
            <div className="header-left">
                {/* Có thể để trống hoặc thêm Breadcrumb sau */}
            </div>
            <div className="header-right">
                {user ? (
                    <div className="user-profile">
                    <Space size="middle">
                        <span>Chào, {user.full_name || user.username}!</span>
                        <Button type="primary" danger onClick={handleLogout}>
                            Đăng xuất
                        </Button>
                    </Space>
                </div>
                
                ) : <p>Đang tải...</p>}
            </div>
        </header>
    );
};

export default Header;