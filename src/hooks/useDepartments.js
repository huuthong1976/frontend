// src/hooks/useDepartments.js
import { useState, useEffect, useCallback } from 'react';
import * as departmentAPI from '../services/departmentAPI';
import { message } from 'antd';

export const useDepartments = (filters = {}) => {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchDepartments = useCallback(async () => {
        setLoading(true);
        try {
            const response = await departmentAPI.getDepartments(filters);
            setDepartments(response.data);
        } catch (error) {
            message.error('Không thể tải danh sách phòng ban.');
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchDepartments();
    }, [fetchDepartments]);

    const addDepartment = async (departmentData) => {
        try {
            await departmentAPI.createDepartment(departmentData);
            message.success('Tạo mới phòng ban thành công!');
            fetchDepartments(); // Tải lại danh sách
        } catch (error) {
            message.error(error.response?.data?.error || 'Tạo mới thất bại.');
        }
    };

    const editDepartment = async (id, departmentData) => {
        try {
            await departmentAPI.updateDepartment(id, departmentData);
            message.success('Cập nhật phòng ban thành công!');
            fetchDepartments();
        } catch (error) {
            message.error(error.response?.data?.error || 'Cập nhật thất bại.');
        }
    };

    const removeDepartment = async (id) => {
        try {
            await departmentAPI.deleteDepartment(id);
            message.success('Xóa phòng ban thành công!');
            fetchDepartments();
        } catch (error) {
            message.error(error.response?.data?.error || 'Xóa thất bại.');
        }
    };

    return { departments, loading, addDepartment, editDepartment, removeDepartment };
};