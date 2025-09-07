// src/features/kpi/KpiPlanPage.js
import React from 'react';
import { Card, Spin, Alert, Button } from 'antd';
import { useKpiPlan } from '../../hooks/useKpiPlan';
import KpiTable from './components/KpiTable'; // Import component con

// Trang này giờ chỉ làm nhiệm vụ lắp ráp các mảnh lại với nhau
const KpiPlanPage = ({ userId, month, year }) => {
    const { plan, loading, error, permissions, updateKpiItem, saveChanges } = useKpiPlan(userId, month, year);

    if (loading) return <Card><Spin /></Card>;
    if (error) return <Card><Alert message="Lỗi" description={error} type="error" /></Card>;
    if (!plan) return null;

    return (
        <Card>
            {/* Có thể tách Header ra component KpiHeader.js */}
            <Title level={4}>Kế hoạch & Đánh giá KPI</Title>
            <Text>Trạng thái: <Tag>{plan.status}</Tag></Text>
            
            <KpiTable 
                items={plan.items}
                onInputChange={updateKpiItem}
                permissions={permissions}
            />

            <div style={{ marginTop: 20, textAlign: 'right' }}>
                <Button type="primary" onClick={saveChanges} loading={loading}>
                    Lưu thay đổi
                </Button>
            </div>
        </Card>
    );
};
export default KpiPlanPage;