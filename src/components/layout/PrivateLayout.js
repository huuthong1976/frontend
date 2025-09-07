// src/components/layout/PrivateLayout.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import MainLayout from './MainLayout'; // ✅ Import MainLayout

const PrivateLayout = () => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <div>Đang tải...</div>; 
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    // ✅ Nếu đã đăng nhập, render MainLayout. 
    // MainLayout sẽ tự chứa Outlet để render các trang con.
    return <MainLayout />;
};

export default PrivateLayout;