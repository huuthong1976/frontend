// client/src/context/AuthContext.js
import React, { createContext, useContext, useState, useMemo } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser]   = useState(() => {
    try { return JSON.parse(localStorage.getItem('user') || 'null'); }
    catch { return null; }
  });

  const isAuthenticated = !!token;

  const login = async (username, password) => {
    const { data } = await api.post('/api/auth/login', { username, password });
    // giả sử API trả { token, user }
    if (data?.token) {
      localStorage.setItem('token', data.token);
      if (data.user) localStorage.setItem('user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user || null);
    }
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken('');
    setUser(null);
  };

  const value = useMemo(
    () => ({ token, user, isAuthenticated, login, logout, setToken, setUser }),
    [token, user, isAuthenticated]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
