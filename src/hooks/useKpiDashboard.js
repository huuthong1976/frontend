// src/hooks/useKpiDashboard.js
import { useReducer, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext'; // Hook để lấy thông tin người dùng
import { getKpiSummary, getCompanies } from '../services/api.service'; // Các hàm gọi API

// --- Reducer: Quản lý state phức tạp một cách nhất quán ---
// Sử dụng reducer giúp tránh các lỗi khi cập nhật nhiều state liên quan đến nhau
const initialState = {
    plans: [],
    companies: [],
    loading: true,
    error: null,
    filters: {
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        companyId: undefined, // undefined để không gửi lên server nếu không chọn
    },
};

const reducer = (state, action) => {
    switch (action.type) {
        case 'FETCH_START':
            return { ...state, loading: true, error: null };
        case 'FETCH_SUCCESS':
            return {
                ...state,
                loading: false,
                plans: action.payload.plans,
                companies: action.payload.companies || state.companies, // Chỉ cập nhật companies nếu có
            };
        case 'FETCH_ERROR':
            return { ...state, loading: false, error: action.payload };
        case 'SET_FILTERS':
            return { ...state, filters: { ...state.filters, ...action.payload } };
        default:
            return state;
    }
};

/**
 * Custom Hook: Chứa toàn bộ logic, state và các hàm xử lý cho trang KPI Dashboard.
 * @returns {object} - Trả về state và các hàm cần thiết cho component.
 */
export const useKpiDashboard = () => {
    const { user } = useAuth(); // Lấy thông tin người dùng (id, role, company_id)
    const [state, dispatch] = useReducer(reducer, initialState);

    /**
     * Hàm tải dữ liệu chính, được tối ưu bằng useCallback.
     * Sẽ được gọi lại mỗi khi bộ lọc (filters) thay đổi.
     */
    const fetchData = useCallback(async () => {
        if (!user) return;
    
        dispatch({ type: 'FETCH_START' });
        try {
            let finalCompanyId = state.filters.companyId;
            if (user.role === 'manager') {
                finalCompanyId = user.company_id;
            }
    
            const apiFilters = {
                month: state.filters.month,
                year: state.filters.year,
                companyId: finalCompanyId,
            };
    
            // Gọi đồng thời các API cần thiết
            const [plansResponse, companiesResponse] = await Promise.all([
                getKpiSummary(apiFilters),
                (user.role === 'admin' || user.role === 'director') && state.companies.length === 0
                    ? getCompanies()
                    : Promise.resolve(null)
            ]);
    
            // SỬA LỖI: Lấy dữ liệu từ thuộc tính .data của response Axios
            const plansData = plansResponse.data;
            const companiesData = companiesResponse ? companiesResponse.data : null;
            
            // Cập nhật state với dữ liệu đã được xử lý
            dispatch({ type: 'FETCH_SUCCESS', payload: { plans: plansData, companies: companiesData } });
    
        } catch (err) {
            const errorMessage = err.response?.data?.error || err.message || 'Lỗi không xác định';
            dispatch({ type: 'FETCH_ERROR', payload: errorMessage });
        }
         }, [user, state.filters, state.companies.length]);

         const reducer = (state, action) => {
            switch (action.type) {
                case 'FETCH_START':
                    return { ...state, loading: true, error: null };
                case 'FETCH_SUCCESS':
                    return {
                        ...state,
                        loading: false,
                        plans: action.payload.plans,
                        companies: action.payload.companies ? action.payload.companies : state.companies, // Dòng này vẫn đúng
                    };
                case 'FETCH_ERROR':
                    return { ...state, loading: false, error: action.payload };
                case 'SET_FILTERS':
                    return { ...state, filters: { ...state.filters, ...action.payload } };
                default:
                    return state;
            }
        };
    // Tự động gọi fetchData khi component được tải hoặc khi fetchData thay đổi
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    /**
     * Hàm để component giao diện có thể cập nhật bộ lọc.
     * @param {object} newFilters - Các giá trị lọc mới.
     */
    const setFilters = (newFilters) => {
        dispatch({ type: 'SET_FILTERS', payload: newFilters });
    };

    // Trả về một giao diện (interface) sạch sẽ cho component
    return {
        ...state, // plans, companies, loading, error, filters
        user,     // Thông tin người dùng hiện tại
        setFilters, // Hàm để cập nhật bộ lọc
        refetch: fetchData, // Hàm để tải lại dữ liệu thủ công nếu cần
    };
};