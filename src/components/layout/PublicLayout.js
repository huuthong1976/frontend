// File: src/components/layout/PublicLayout.js

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const PublicLayout = () => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <div className="page-container">Đang tải...</div>;
    }

    // Nếu chưa đăng nhập, cho phép truy cập (ví dụ: trang login)
    // Nếu đã đăng nhập, điều hướng về trang dashboard
    return !isAuthenticated ? <Outlet /> : <Navigate to="/dashboard" replace />;
};

export default PublicLayout;