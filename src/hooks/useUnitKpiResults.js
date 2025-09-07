// src/hooks/useUnitKpiResults.js
import { useState, useEffect, useCallback } from 'react';
import { getUnitKpiResults, saveUnitKpiResults } from '../services/unitKpiAPI';
import { message } from 'antd';

export const useUnitKpiResults = (filters) => {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        if (!filters.companyId || !filters.year || !filters.month) return;
        setLoading(true);
        try {
            const response = await getUnitKpiResults(filters);
            setResults(response.data);
        } catch (error) {
            message.error('Không thể tải dữ liệu kết quả KPI.');
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const updateResultValue = (registration_id, value) => {
        setResults(prev => 
            prev.map(item => 
                item.registration_id === registration_id ? { ...item, actual_result: value } : item
            )
        );
    };
    
    const saveAllResults = async () => {
        setLoading(true);
        try {
            const dataToSave = results.map(item => ({
                registration_id: item.registration_id,
                month: filters.month,
                year: filters.year,
                actual_result: item.actual_result || null
            }));
            await saveUnitKpiResults(dataToSave);
            message.success('Lưu kết quả thành công!');
        } catch (error) {
            message.error('Lưu kết quả thất bại.');
        } finally {
            setLoading(false);
        }
    };

    return { results, loading, updateResultValue, saveAllResults };
};