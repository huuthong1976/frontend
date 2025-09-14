// src/components/auth/ProtectedRoute.js
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';

/**
 * Component này kiểm tra quyền truy cập của người dùng vào một route.
 * @param {object} props
 * @param {React.ReactNode} props.children - Component con sẽ được render nếu người dùng có quyền.
 * @param {string[]} props.allowedRoles - Mảng các vai trò được phép truy cập.
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useContext(AuthContext);

    // Nếu đang trong quá trình tải thông tin người dùng, chưa render gì cả
    if (loading) {
        return <div>Đang tải...</div>;
    }

    // Kiểm tra xem người dùng đã đăng nhập và có vai trò phù hợp không
    const isAuthorized = user && allowedRoles.includes(user.role);

    if (!isAuthorized) {
        // Nếu không có quyền, điều hướng về trang chủ hoặc trang "không có quyền"
        // Ở đây ví dụ điều hướng về trang kế hoạch cá nhân
        return <Navigate to="/my-kpi" replace />;
    }

    // Nếu có quyền, render component con
    return children;
};

export default ProtectedRoute;