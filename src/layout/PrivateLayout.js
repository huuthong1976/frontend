import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MainLayout from '../layout/MainLayout';

export default function PrivateLayout() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <div style={{ padding: 24 }}>Đang tải...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return <MainLayout />; // Outlet của MainLayout sẽ render các trang con
}
