import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PublicLayout() {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div style={{ padding: 24 }}>Đang tải...</div>;
  return !isAuthenticated ? <Outlet /> : <Navigate to="/dashboard" replace />;
}
