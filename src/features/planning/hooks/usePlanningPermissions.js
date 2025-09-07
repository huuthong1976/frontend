import { useEffect, useState } from 'react';
import { fetchMe } from '../api/masterApi';

export default function usePlanningPermissions(){
  const [canCreate, setCanCreate] = useState(false);
  useEffect(() => {
    (async () => {
      try {
        const me = (await fetchMe()).data;
        const role = String(me.role || me.role_name || '').toLowerCase().trim();
        const ok = role.includes('admin') || role.includes('unithead') || role.includes('unit_head')
                || role.includes('trưởng') || role.includes('truong');
        setCanCreate(ok);
      } catch { setCanCreate(false); }
    })();
  }, []);
  return { canCreate };
}
