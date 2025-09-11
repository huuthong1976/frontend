// frontend/components/auth/LoginPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './LoginPage.css';
// ✅ 1. Import biểu tượng con mắt
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    // ✅ 2. Thêm state để quản lý trạng thái ẩn/hiện mật khẩu
    const [showPassword, setShowPassword] = useState(false);
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
                    {/* ✅ 3. Thay đổi type của input và thêm icon */}
                    <input 
                        id="password"
                        type={showPassword ? 'text' : 'password'} // Thay đổi type dựa trên state
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <span 
                        className="password-toggle-icon" 
                        onClick={() => setShowPassword(!showPassword)} // Thêm sự kiện click
                    >
                        {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                    </span>
                </div>
                
                <button type="submit" className="login-btn">Đăng nhập</button>
            </form>
        </div>
    );
};

export default LoginPage;