import api from 'utils/api';
export const fetchUnits = () => api.get('/units');
export const fetchRooms = () => api.get('/rooms');
export const fetchMe    = () => api.get('/me');
