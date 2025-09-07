// src/hooks/useManagerDashboardData.js
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { getCompanies, getSubordinatesForManager } from '../services/api.service';

export const useManagerDashboardData = () => {
    const { user } = useAuth();
    const [companies, setCompanies] = useState([]);
    const [subordinates, setSubordinates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    const [filters, setFilters] = useState({
        company_id: user?.company_id || '',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        status: 'all'
    });

    // Tải danh sách công ty (chỉ dành cho Admin/CEO)
    useEffect(() => {
        if (user?.role === 'Admin' || user?.role === 'TongGiamDoc') {
            getCompanies().then(setCompanies).catch(() => setError('Lỗi tải danh sách công ty.'));
        }
    }, [user]);

    // Tải danh sách nhân viên cấp dưới khi bộ lọc thay đổi
    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
    
        try {
            let params = {
                month: filters.month,
                year: filters.year,
                status: filters.status || 'all',
            };
    
            // ✅ Chỉ Admin / TGĐ mới truyền company_id
            if (user?.role === 'Admin' || user?.role === 'TongGiamDoc') {
                if (!filters.company_id) {
                    setSubordinates([]);
                    setLoading(false);
                    return;
                }
                params.company_id = filters.company_id;
            }
    
            const data = await getSubordinatesForManager(params);
            setSubordinates(data);
        } catch (err) {
            setError('Không thể tải dữ liệu nhân viên.');
        } finally {
            setLoading(false);
        }
    }, [filters, user]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { user, companies, subordinates, loading, error, filters, setFilters, refreshData: fetchData };
};