// src/context/AuthContext.js
import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load thông tin user nếu đã có token
  const loadUser = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) { setLoading(false); return; }
      const res = await api.get('/api/auth/me'); // hoặc endpoint me của bạn
      setUser(res.data?.user ?? res.data ?? null);
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401) {
        localStorage.removeItem('token');
        setUser(null);
      } else {
        console.warn('loadUser failed:', err.message || err);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadUser(); }, [loadUser]);

  // identifier = username hoặc email
  const login = async (identifier, password) => {
    try {
      // gửi cả username & email để BE match theo 1 trong 2 trường
      const res = await api.post('/api/auth/login', {
        username: identifier,
        email: identifier,
        password,
      });

      // token có thể là 'accessToken' hoặc 'token'
      const token = res.data?.accessToken || res.data?.token;
      const me = res.data?.user ?? null;

      if (!token) {
        return { success: false, error: 'Không nhận được token từ server.' };
      }

      localStorage.setItem('token', token);
      setUser(me);
      return { success: true, user: me };
    } catch (error) {
      localStorage.removeItem('token');
      setUser(null);
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.msg ||
        'Đăng nhập thất bại';
      return { success: false, error: msg };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
