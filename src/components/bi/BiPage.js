// src/components/bi/BiPage.js
import React from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell
} from 'recharts';

const BiPage = () => {
    // Dữ liệu mẫu (có thể lấy từ API thực tế)
    const salesData = [
        { name: 'Tháng 1', DoanhThu: 4000, ChiPhi: 2400 },
        { name: 'Tháng 2', DoanhThu: 3000, ChiPhi: 1398 },
        { name: 'Tháng 3', DoanhThu: 2000, ChiPhi: 9800 },
        { name: 'Tháng 4', DoanhThu: 2780, ChiPhi: 3908 },
        { name: 'Tháng 5', DoanhThu: 1890, ChiPhi: 4800 },
        { name: 'Tháng 6', DoanhThu: 2390, ChiPhi: 3800 },
    ];

    const kpiData = [
        { name: 'KPI A', value: 70 },
        { name: 'KPI B', value: 85 },
        { name: 'KPI C', value: 60 },
        { name: 'KPI D', value: 95 },
    ];
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    // Đã xóa biến employeePerformance vì nó không còn được sử dụng.
    // const employeePerformance = [
    //     { name: 'NV A', Điểm: 90, MứcĐộHoànThành: 0.9 },
    //     { name: 'NV B', Điểm: 75, MứcĐộHoànThành: 0.75 },
    //     { name: 'NV C', Điểm: 88, MứcĐộHoànThành: 0.88 },
    //     { name: 'NV D', Điểm: 65, MứcĐộHoànThành: 0.65 },
    // ];

    return (
        <div className="bi-page-container">
            <h2>Business Intelligence & Analytics</h2>

            <div className="chart-grid">
                <div className="chart-card">
                    <h3>Doanh thu & Chi phí theo tháng</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={salesData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="DoanhThu" fill="#8884d8" name="Doanh thu" />
                            <Bar dataKey="ChiPhi" fill="#82ca9d" name="Chi phí" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="chart-card">
                    <h3>Xu hướng Doanh thu</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={salesData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="DoanhThu" stroke="#8884d8" activeDot={{ r: 8 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div className="chart-card">
                    <h3>Tỷ lệ hoàn thành KPI trung bình</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={kpiData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                                {kpiData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Phần ScatterChart đã được comment hoặc xóa */}
            </div>
        </div>
    );
};

export default BiPage;