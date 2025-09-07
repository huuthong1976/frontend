// src/pages/MyKpiPage.js

import React, { useState } from 'react';
import { Select, Spin, Card, Space, Alert } from 'antd';
import { useMyKpiData } from '../hooks/useMyKpiData';

// Import các component con
import KpiPlanPage from './KpiPlanPage'; 
import KpiPlanCreator from './KpiPlanCreator';

const { Option } = Select;

const MyKpiPage = () => {
// State quản lý kỳ đang chọn, mặc định là tháng/năm hiện tại
   const [period, setPeriod] = useState({
       month: new Date().getMonth() + 1,
       year: new Date().getFullYear()
   });

    // ✅ NÂNG CẤP: Hook giờ đây trả về cả hàm `refetch` để làm mới dữ liệu
    const { planData, loading, error, refetch } = useMyKpiData(period.month, period.year);
    
    const handleMonthChange = (newMonth) => {
        setPeriod({ ...period, month: newMonth });
    };

    const handleYearChange = (newYear) => {
        setPeriod({ ...period, year: newYear });
    };

    // --- Render Functions ---
    const renderContent = () => {
        if (loading) {
            return <Spin size="large" />;
        }
        if (error) {
            return <Alert message="Lỗi" description={error} type="error" />;
        }
        
        // Nếu có planData, truyền nó vào KpiPlanPage
        if (planData) {
            return <KpiPlanPage initialPlanData={planData} onPlanUpdate={refetch} />;
        } else {
            // Nếu không (planData là null), hiển thị form tạo mới
            return <KpiPlanCreator month={period.month} year={period.year} onCreationSuccess={refetch} />;
        }
    };

    const renderYearOptions = () => {
        const currentYear = new Date().getFullYear();
        const years = [];
        for (let i = currentYear - 5; i <= currentYear + 1; i++) {
            years.push(<Option key={i} value={i}>{i}</Option>);
        }
        return years;
    };

    return (
        <div>
            <Card style={{ marginBottom: 24 }}>
                <Space>
                    <span style={{ fontWeight: 500 }}>Chọn kỳ đánh giá:</span>
                    <Select value={period.month} onChange={handleMonthChange} style={{ width: 120 }}>
                        {/* ✅ NÂNG CẤP: Tự động render 12 tháng */}
                        {[...Array(12).keys()].map(i => (
                            <Option key={i + 1} value={i + 1}>Tháng {i + 1}</Option>
                        ))}
                    </Select>
                    <Select value={period.year} onChange={handleYearChange} style={{ width: 120 }}>
                        {/* ✅ NÂNG CẤP: Tự động render các năm */}
                        {renderYearOptions()}
                    </Select>
                </Space>
            </Card>
            {renderContent()}
        </div>
    );
};

export default MyKpiPage;