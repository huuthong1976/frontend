// src/hooks/useDashboardData.js
import { useState, useEffect, useCallback, useMemo } from 'react';
import { getDashboardSummary } from '../services/dashboardAPI';
// import { useAuth } from '../context/AuthContext'; // Dùng khi có hệ thống xác thực hoàn chỉnh

export const useDashboardData = () => {
    // 2. Sử dụng useMemo để object 'user' không bị tạo lại mỗi lần render
    const user = useMemo(() => ({ 
        role: 'director', 
        company_id: 1 
    }), []);

    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({ 
        // Đặt companyId mặc định nếu user là manager
        companyId: user?.role === 'manager' ? user.company_id : undefined 
    });

    const fetchData = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        setError(null);
        try {
            const data = await getDashboardSummary(filters);
            setSummary(data);
        } catch (err) {
            setError('Không thể tải dữ liệu tổng quan.');
        } finally {
            setLoading(false);
        }
    }, [filters, user]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { summary, loading, error, filters, setFilters, user, refetch: fetchData };
};