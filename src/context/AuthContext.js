// src/context/AuthContext.js
import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import api from '../utils/api'; 

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // ✅ CẢI TIẾN: Không cần hàm setAuthToken riêng lẻ nữa, Interceptor sẽ tự xử lý.

    const loadUser = useCallback(async () => {
        // Interceptor đã tự động thêm token nếu có
        if (localStorage.getItem('token')) {
            try {
                // ✅ THAY ĐỔI: Dùng `api` và đường dẫn tương đối
                const res = await api.get('/auth/me');
                setUser(res.data);
            } catch (err) {
                console.error("Token không hợp lệ hoặc đã hết hạn.", err);
                // Tự động logout nếu token sai
                localStorage.removeItem('token');
                setUser(null);
            }
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        loadUser();
    }, [loadUser]);

    const login = async (username, password) => {
        try {
            // ✅ THAY ĐỔI: Dùng `api` và đường dẫn tương đối
            const res = await api.post('/auth/login', { username, password });
            const { accessToken, user } = res.data;
            if (accessToken) {
            localStorage.setItem('token', accessToken);
            setUser(user);
            return { success: true, user };
        } else {
            return { success: false, error: 'Không nhận được token từ server.' };
        }
        } catch (error) {
            // Khi đăng nhập sai, chỉ cần xóa token cũ (nếu có)
            localStorage.removeItem('token');
            setUser(null);
            return { success: false, error: error.response?.data?.msg || 'Đăng nhập thất bại' };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    // Tính toán giá trị isAuthenticated trực tiếp từ state `user`
    const isAuthenticated = !!user;

    const value = {
        user,
        loading,
        isAuthenticated,
        login,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// Hook tùy chỉnh để sử dụng context dễ dàng hơn
export const useAuth = () => {
    return useContext(AuthContext);
};