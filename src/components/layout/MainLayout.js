// src/components/layout/MainLayout.js
import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import './Layout.css'; // Cần tạo file CSS cho layout

const MainLayout = () => {
    return (
        <div className="app-container">
            <Sidebar />
            <div className="main-content">
                <Header />
                <main className="page-content">
                    {/* Component của trang hiện tại sẽ được render ở đây */}
                    <Outlet /> 
                </main>
            </div>
        </div>
    );
};

export default MainLayout;