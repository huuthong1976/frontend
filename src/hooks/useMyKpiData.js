// src/hooks/useMyKpiData.js
import { useState, useEffect, useCallback } from 'react';
import { message } from 'antd';
// Giả sử bạn có một file api.js để cấu hình axios
import { getMyKpiPlan } from '../services/api.service';

export const useMyKpiData = (month, year) => {
    const [planData, setPlanData] = useState(undefined);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        if (!month || !year) return;

        setLoading(true);
        setError(null);
        try {
            const data = await getMyKpiPlan(month, year);
            setPlanData(data);
           
        } catch (err) {
            const errorMessage = err.response?.data?.error || 'Không thể tải dữ liệu KPI.';
            setError(errorMessage);
            message.error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [month, year]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Trả về hàm `fetchData` để component cha có thể gọi và làm mới dữ liệu
    return { planData, loading, error, refetch: fetchData };
};