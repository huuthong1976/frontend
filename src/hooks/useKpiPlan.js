// src/hooks/useKpiPlan.js
import { useReducer, useEffect, useCallback, useMemo } from 'react';
import { message } from 'antd';
import { getKpiPlanDetails, saveKpiPlan, submitKpiPlanForReview } from '../services/kpiAPI'; 
import { useAuth } from '../context/AuthContext';

// --- Reducer: Không thay đổi ---
const initialState = {
    plan: null,
    linkableUnitKpis: [],
    loading: true,
    error: null,
};

const kpiPlanReducer = (state, action) => {
    switch (action.type) {
        case 'FETCH_START':
            return { ...state, loading: true, error: null };
        case 'FETCH_SUCCESS':
            return {
                ...state,
                loading: false,
                plan: action.payload.plan,
                linkableUnitKpis: action.payload.linkableUnitKpis,
            };
        case 'FETCH_ERROR':
            return { ...state, loading: false, error: action.payload };
        case 'UPDATE_ITEM':
            if (!state.plan) return state;
            const updatedItems = state.plan.items.map(item =>
                item.id === action.payload.id ? { ...item, ...action.payload.changes } : item
            );
            return { ...state, plan: { ...state.plan, items: updatedItems } };
        case 'SET_LOADING':
            return { ...state, loading: action.payload };
        default:
            return state;
    }
};


// ✅ CẢI TIẾN: Hook chuyên tính toán, tách biệt khỏi logic fetch data
const useKpiCalculations = (plan, currentUser) => {
    return useMemo(() => {
        if (!plan || !currentUser) {
            return { permissions: {}, totalWeight: 0, finalScore: 0 };
        }
        
        const totalWeight = plan.items.reduce((sum, item) => sum + (Number(item.weight) || 0), 0);
        
        const finalScore = plan.items.reduce((sum, item) => {
            let score = 0;
            if (item.director_score !== null) score = item.director_score;
            else if (item.manager_score !== null) score = item.manager_score;
            else if (item.self_score !== null) score = item.self_score;
            return sum + ((Number(score) || 0) * (Number(item.weight) || 0) / 100);
        }, 0).toFixed(2);
        
        const permissions = {
            canEditPlan: plan.status === 'DRAFT' && currentUser.id === plan.employee_id,
            canSelfAssess: plan.status === 'SELF_ASSESSMENT' && currentUser.id === plan.employee_id,
            canManagerAssess: plan.status === 'PENDING_REVIEW' && currentUser.role === 'manager',
            canDirectorAssess: plan.status === 'DIRECTOR_REVIEW' && currentUser.role === 'director',
        };

        return { permissions, totalWeight, finalScore };
    }, [plan, currentUser]); // Phụ thuộc rõ ràng vào plan và currentUser
};


/**
 * Custom Hook chính: Quản lý state và các hàm xử lý cho trang KPI.
 */
export const useKpiPlan = (planId) => {
    const [state, dispatch] = useReducer(kpiPlanReducer, initialState);
    const { user: currentUser } = useAuth();
    
    // ✅ KHẮC PHỤC: Tách `plan` ra khỏi `state` để làm dependency cho hook tính toán
    const { plan } = state;
    
    // ✅ CẢI TIẾN: Gọi hook tính toán với các dependency rõ ràng
    const derivedState = useKpiCalculations(plan, currentUser);

    const fetchData = useCallback(async () => {
        if (!planId) {
            dispatch({ type: 'FETCH_ERROR', payload: 'Không có ID của kế hoạch.' });
            return;
        }
        dispatch({ type: 'FETCH_START' });
        try {
            const data = await getKpiPlanDetails(planId);
            dispatch({ type: 'FETCH_SUCCESS', payload: data });
        } catch (err) {
            const errorMessage = err.response?.data?.error || err.message || 'Lỗi không xác định';
            dispatch({ type: 'FETCH_ERROR', payload: errorMessage });
        }
    }, [planId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const updateKpiItem = (id, changes) => {
        dispatch({ type: 'UPDATE_ITEM', payload: { id, changes } });
    };

    const saveChanges = async () => {
        if (!state.plan) return;
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            await saveKpiPlan(state.plan);
            message.success('Lưu thay đổi thành công!');
            dispatch({ type: 'SET_LOADING', payload: false });
        } catch (err) {
            const errorMessage = err.response?.data?.error || 'Lưu thay đổi thất bại.';
            message.error(errorMessage);
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };

    const submit = async (nextStatus) => {
        if (!state.plan) return;
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            await submitKpiPlanForReview(state.plan.id, state.plan.items, nextStatus);
            message.success('Nộp thành công!');
            await fetchData();
        } catch (err) {
            const errorMessage = err.response?.data?.error || 'Nộp thất bại.';
            message.error(errorMessage);
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };

    return {
        plan: state.plan,
        linkableUnitKpis: state.linkableUnitKpis,
        loading: state.loading,
        error: state.error,
        currentUser,
        ...derivedState, // permissions, totalWeight, finalScore
        updateKpiItem,
        saveChanges,
        submit,
    };
};