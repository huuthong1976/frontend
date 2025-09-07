// src/hooks/useEmployeeFilters.js
import { useState, useEffect } from 'react';
// Giả sử các hàm này đã được tạo trong service API
import { getCompanies, getDepartments } from '../services/api.service';

export const useEmployeeFilters = () => {
    const [companies, setCompanies] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFilterData = async () => {
            try {
                // Gọi đồng thời để tăng tốc
                const [companyRes, departmentRes] = await Promise.all([
                    getCompanies(),
                    getDepartments() // Lấy tất cả phòng ban ban đầu
                ]);
                setCompanies(companyRes.data);
                setDepartments(departmentRes.data);
            } catch (error) {
                console.error("Failed to fetch filter data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchFilterData();
    }, []);

    return { companies, departments, loadingFilters: loading };
};