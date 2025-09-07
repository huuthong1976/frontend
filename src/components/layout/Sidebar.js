// src/components/layout/Sidebar.js
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Layout.css'; // Sử dụng file CSS chung

const menuConfig = (user) => [
    {
        name: 'Tổng quan',
        path: '/dashboard',
    },
    {
        name: 'Cá nhân',
        children: [
            { name: 'KPI của tôi', path: '/my-kpi' },
            { name: 'Hồ sơ cá nhân', path: '/my-profile' },
            { name: 'Bảng chấm công', path: '/my-timesheet' },
            { name: 'Đề xuất', path: '' },
            { name: 'Nhật ký', path: '' },
        ]
    },
    {
        name: 'Quản trị KPI',
        condition: user && ['Admin', 'TongGiamDoc', 'TruongDonVi'].includes(user.role),
        children: [
            { name: 'Cập nhật danh sách KPI', path: '/kpi-library' },
            { name: 'Cấu hình tỷ trọng', path: '/perspective-weights' },
            { name: 'Duyệt KPI Nhân viên', path: 'kpi/manager-kpi-dashboard' },
            { name: 'Đăng ký KPI Đơn vị', path: '/company-kpi-registration' },
            { name: 'Kết quả KPI Đơn vị', path: '/company-monthly-result' },
        ]
    },
    // Các module khác sẽ được thêm vào đây
    {
        name: 'Quản lý lương',
        condition: user && ['Admin', 'TongGiamDoc',  'KeToan'].includes(user.role),
        children: [
            { name: 'Bảng lương chi tiết', path: '/payroll' },
            { name: 'Báo cáo tổng hợp đơn vị', path: '/' },
            { name: 'Báo cáo tổng hợp tổng cty', path: '/' },
        ]
    },   
    {
        name: 'Quản lý nhân sự',
        condition: user && ['Admin', 'TongGiamDoc', 'TruongDonVi', 'Truongphong'].includes(user.role),
        children: [
            { name: 'Dashboard Tổng quan', path: '/' },
            { name: 'Quản lý hồ sơ nhân viên', path: '/hrm' },
            { name: 'Quản lý tổ chức', path: '/companies' },
            { name: 'Quản lý chấm công & Nghỉ phép', path: '/' },
            { name: 'Tích hợp AI', path: '/' },
        ]
    },  
    {
        name: 'Quản lý dự án',
        condition: user && ['Admin', 'TongGiamDoc', 'TruongDonVi'].includes(user.role),
        children: [
            { name: 'Tổng quan dự án', path: '/' },
            { name: 'Danh sách dự án', path: '/' },
            { name: 'Kế hoạch & Công việc', path: '/' },
            { name: 'Nhân sự & Phân công', path: '/' },
            { name: 'Tài chính & Nguồn lực', path: '/' },
            { name: 'Rủi ro & Vấn đề', path: '/' },
            { name: 'Tài liệu & Ghi chú', path: '/' },
            { name: 'Báo cáo & Thống kê', path: '/' },
            { name: 'Cài đặt dự án', path: '/' },
        ]
    },  
    {
        name: 'Quản trị Hệ thống',
        condition: user && ['Admin', 'TongGiamDoc'].includes(user.role),
        children: [
            { name: 'Cài đặt', path: '' },
            { name: 'Thêm user mới', path: '/admin/create' },
           
            { name: 'Lịch sử người dùng', path: '/' },
            { name: 'Danh sách phòng ban', path: '/departments' },
            { name: 'Danh sách công ty', path: '/companies' },
            { name: 'Quản lý người dùng', path: '/' },
            { name: 'Báo cáo hệ thống', path: '/' },
        ]
    },  
];

const Sidebar = () => {
    const { user } = useAuth();
    const availableMenu = menuConfig(user);
    
    // ✅ BƯỚC 1: Thêm state để quản lý menu đang mở
    const [openMenu, setOpenMenu] = useState('Cá nhân'); // Mặc định mở menu 'Cá nhân'

    // ✅ BƯỚC 2: Tạo hàm xử lý khi click vào menu cha
    const handleMenuClick = (menuName) => {
        // Nếu menu đang mở được click lại, thì đóng nó lại. Ngược lại, mở menu mới.
        setOpenMenu(openMenu === menuName ? null : menuName);
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <h3>BSC-KPI System</h3>
            </div>
            <nav className="menu-nav">
                <ul>
                    {availableMenu.map(item => (
                        (item.condition !== false) && (
                            <li key={item.name}>
                                {item.path ? (
                                    <NavLink to={item.path}>{item.name}</NavLink>
                                ) : (
                                    // ✅ BƯỚC 3: Thêm sự kiện onClick cho các mục menu cha
                                    <div 
                                        className={`menu-group-title ${openMenu === item.name ? 'active' : ''}`}
                                        onClick={() => handleMenuClick(item.name)}
                                    >
                                        {item.name}
                                    </div>
                                )}
                                {item.children && (
                                    // ✅ BƯỚC 4: Thêm class 'active' khi menu được mở
                                    <ul className={`sub-menu ${openMenu === item.name ? 'active' : ''}`}>
                                        {item.children.map(child => (
                                            <li key={child.name}>
                                                <NavLink to={child.path}>{child.name}</NavLink>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </li>
                        )
                    ))}
                </ul>
            </nav>
        </aside>
    );
};

export default Sidebar;