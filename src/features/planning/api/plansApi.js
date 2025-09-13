import api from '../../utils/api';
export const fetchPlans = (params) => api.get('/plans', { params });
export const createPlan = (payload)  => api.post('/plans', payload);
export const updatePlan = (id, payload) => api.put(`/plans/${id}`, payload);
export const deletePlan = (id) => api.delete(`/plans/${id}`);
export const checkConflicts = (payload) => api.post('/plans/check-conflicts', payload);
