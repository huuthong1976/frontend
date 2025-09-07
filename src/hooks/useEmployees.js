// src/hooks/useEmployees.js
import { useState, useEffect, useCallback } from 'react';
import * as employeeAPI from '../services/employeeAPI';
import { message } from 'antd';

export const useEmployees = () => {
    const [employees, setEmployees] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, limit: 10, totalItems: 0 });
    const [filters, setFilters] = useState({});
    const [loading, setLoading] = useState(true);

    const fetchEmployees = useCallback(async () => {
        setLoading(true);
        try {
            const params = { ...filters, page: pagination.page, limit: pagination.limit };
            const response = await employeeAPI.getEmployees(params);
            setEmployees(response.data.data);
            setPagination(response.data.pagination);
        } catch (error) {
            message.error('Không thể tải danh sách nhân viên.');
        } finally {
            setLoading(false);
        }
    }, [filters, pagination.page, pagination.limit]);

    useEffect(() => {
        fetchEmployees();
    }, [fetchEmployees]);

    // Các hàm add, edit, remove tương tự như các module trước
    // ...

    return { employees, pagination, loading, filters, setFilters, setPagination, refetch: fetchEmployees };
};