// frontend/components/auth/LoginPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {useAuth} from '../../context/AuthContext';
import './LoginPage.css'; // Import file CSS mới

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const result = await login(username, password);
        if (result.success) {
            navigate('/dashboard');

        } else {
            setError(result.error);
        }
    };

    return (
        <div className="login-container">
            <form className="login-form" onSubmit={handleSubmit}>
                <h2>Đăng nhập</h2>
                {error && <p className="error-message">{error}</p>}
                
                <div className="input-group">
                    <label htmlFor="username">Tên đăng nhập</label>
                    <input 
                        id="username"
                        type="text" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                
                <div className="input-group">
                    <label htmlFor="password">Mật khẩu</label>
                    <input 
                        id="password"
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                
                <button type="submit" className="login-btn">Đăng nhập</button>
            </form>
        </div>
    );
};

export default LoginPage;