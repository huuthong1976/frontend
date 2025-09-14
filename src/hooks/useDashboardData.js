import { useEffect, useState } from 'react';
import { getDashboardSummary } from '../services/dashboardAPI';

export const useDashboardData = (filters = {}) => {
  const [state, setState] = useState({ summary: null, loading: true, error: null });
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const summary = await getDashboardSummary(filters);
        if (mounted) setState({ summary, loading: false, error: null });
      } catch (err) {
        if (mounted) setState({ summary: null, loading: false, error: err?.message || 'Load dashboard failed' });
      }
    })();
    return () => { mounted = false; };
  }, [JSON.stringify(filters)]);
  return state;
};
