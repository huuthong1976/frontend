// src/services/kpiAspectAPI.js
import apiClient from './apiClient';

export const getKpiAspects = () => {
    return apiClient.get('/api/kpi-aspects');
};
