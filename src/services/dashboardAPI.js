import api from '../utils/api';

export const getDashboardSummary = async (filters = {}) => {
  const res = await api.get('/dashboard/summary', {
    params: { ...filters, _t: Date.now() },
  });

  const root = res?.data ?? {};
  const payload = root.data ?? root;
  const counts = payload.counts ?? payload;
  const n = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : 0);

  return {
    ok: root.ok !== false,
    filters: root.filters || {},
    metrics: {
      employees:      n(counts.employees),
      departments:    n(counts.departments),
      kpiPlans:       n(counts.kpiPlans),
      unitKpiRegs:    n(counts.unitKpiRegs),
      unitKpiResults: n(counts.unitKpiResults),
    },
    companies:        payload.companies || [],
    kpiByDepartment:  payload.kpiByDepartment || [],
    pendingKpiTasks:  payload.pendingKpiTasks || [],
  };
};

