import api from '../../utils/api';
export const fetchTemplates = () => api.get('/planning-templates');
export const resolveTemplate = (key, params) => api.get(`/planning-templates/${key}/resolve`, { params });
