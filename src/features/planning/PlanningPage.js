// -----------------------------------------------------------------------------
// src/features/planning/PlanningPage.js
// Màn hình lập kế hoạch: phân quyền, toolbar, lịch, drawer, form tạo/sửa.
// -----------------------------------------------------------------------------

import React, { useEffect, useState } from 'react';
import api from 'utils/api';
import PlanningToolbar from './PlanningToolbar';
import PlanningCalendar from './PlanningCalendar';
import PlanFormModal from './PlanFormModal';
import RightDrawer from './RightDrawer';
import './planning.css';

// Làm tròn thời gian lên bội số phút (UTC)
const roundUp = (date, stepMinutes = 30) => {
  const ms = stepMinutes * 60 * 1000;
  return new Date(Math.ceil(date.getTime() / ms) * ms);
};

export default function PlanningPage() {
  // ===== Khung nhìn & phạm vi thời gian =====
  const now = new Date();
  const [mode, setMode] = useState('week'); // 'week' | 'month' | 'quarter'
  const [range, setRange] = useState({
    from: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7).toISOString(),
    to:   new Date(now.getFullYear(), now.getMonth(), now.getDate() + 30).toISOString(),
  });

  // ===== Bộ lọc / dữ liệu / trạng thái tải =====
  const [filters, setFilters] = useState({ unit_id: '', room_id: '', type: '' });
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ===== Chọn event, mở form, chế độ sửa =====
  const [selected, setSelected] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [createInitial, setCreateInitial] = useState(null);
  const [editingId, setEditingId] = useState(null); // null = tạo mới, khác null = sửa

  // ===== Phân quyền (Admin/Trưởng đơn vị mới được tạo/sửa) =====
  const [canCreate, setCanCreate] = useState(false);
  useEffect(() => {
    (async () => {
      try {
        const me = (await api.get('/me')).data;
        const roleRaw = String(me.role || me.role_name || '').toLowerCase().trim();
        const ok =
          roleRaw.includes('admin') ||
          roleRaw.includes('unithead') ||
          roleRaw.includes('unit_head') ||
          roleRaw.includes('trưởng') ||
          roleRaw.includes('truong');
        setCanCreate(ok);
      } catch {
        setCanCreate(false);
      }
    })();
  }, []);

  // ===== Load danh sách kế hoạch theo phạm vi/filters =====
  useEffect(() => {
    let ok = true;
    setLoading(true);
    setError('');
    api
      .get('/plans', { params: { ...filters, from: range.from, to: range.to } })
      .then(res => ok && setPlans(Array.isArray(res.data) ? res.data : []))
      .catch(err => ok && setError(err?.response?.data?.msg || 'Không tải được lịch.'))
      .finally(() => ok && setLoading(false));
    return () => { ok = false; };
  }, [filters, range]);

  // ===== Helper: lấy khoảng tuần/tháng đang hiển thị =====
  const getVisibleWeekRange = () => {
    const from = new Date(range.from);
    const to   = new Date(range.to);
    to.setMilliseconds(to.getMilliseconds() - 1);
    from.setUTCHours(0,0,0,0);
    to.setUTCHours(23,59,59,999);
    return { start: from.toISOString(), end: to.toISOString() };
  };
  const getVisibleMonthRange = () => {
    const from = new Date(range.from);
    const to   = new Date(range.to);
    to.setMilliseconds(to.getMilliseconds() - 1);
    from.setUTCHours(0,0,0,0);
    to.setUTCHours(23,59,59,999);
    return { start: from.toISOString(), end: to.toISOString() };
  };

  // ===== CREATE =====
  const openCreateBySpan = (span /* 'week' | 'month' */) => {
    const base = span === 'week' ? getVisibleWeekRange() : getVisibleMonthRange();
    setCreateInitial({
      title: '',
      type: 'meeting',
      unit_id: filters.unit_id ? Number(filters.unit_id) : undefined,
      room_id: undefined,
      participants: [],
      start: base.start,
      end: base.end,
      visibility: 'public',
    });
    setEditingId(null);
    setIsFormOpen(true);
  };

  const openCreateWork = () => {
    const now = new Date();
    const from = new Date(range.from);
    const to   = new Date(range.to);
    to.setMilliseconds(to.getMilliseconds() - 1);

    let start;
    if (now >= from && now <= to) {
      start = roundUp(now, 30);
    } else {
      start = new Date(from);
      start.setUTCHours(9, 0, 0, 0);
    }
    const end = new Date(start.getTime() + 60 * 60 * 1000);

    setCreateInitial({
      title: '',
      type: 'meeting',
      unit_id: filters.unit_id ? Number(filters.unit_id) : undefined,
      room_id: undefined,
      participants: [],
      start: start.toISOString(),
      end: end.toISOString(),
      visibility: 'public',
    });
    setEditingId(null);
    setIsFormOpen(true);
  };

  // ===== EDIT =====
  const openEdit = (plan) => {
    if (!plan) return;
    setCreateInitial({
      title: plan.title,
      type:  plan.type || 'meeting',
      unit_id: plan.unit_id || '',
      room_id: plan.room_id || '',
      participants: plan.participants || [],
      start: plan.start,
      end:   plan.end,
      visibility: plan.visibility || 'public'
    });
    setEditingId(plan.id);
    setIsFormOpen(true);
  };

  // ===== Reload sau khi lưu =====
  const onSaved = () => {
    setIsFormOpen(false);
    setEditingId(null);
    api
      .get('/plans', { params: { ...filters, from: range.from, to: range.to } })
      .then(res => setPlans(Array.isArray(res.data) ? res.data : []));
  };

  // ===== Render =====
  return (
    <div className="planning-page">
      <PlanningToolbar
        mode={mode}
        onModeChange={setMode}
        filters={filters}
        onFiltersChange={setFilters}
        canCreate={canCreate}
        onCreateWeek={() => openCreateBySpan('week')}
        onCreateMonth={() => openCreateBySpan('month')}
        onCreateWork={openCreateWork}
      />

      {error && <div className="alert alert--error">{error}</div>}
      {loading && <div className="alert">Đang tải dữ liệu lịch…</div>}

      {/* BỌC LỊCH BẰNG WRAPPER ĐỂ QUẢN LÝ z-index/overflow */}
      <div className="calendar-wrap">
        <PlanningCalendar
          mode={mode}
          plans={plans}
          onRangeChange={setRange}
          onSelect={setSelected}
          onEventDrop={(plan) => setSelected(plan)}
          canEdit={canCreate}
        />
      </div>

      <RightDrawer
        plan={selected}
        onClose={() => setSelected(null)}
        onUpdated={onSaved}
        onEdit={canCreate ? openEdit : null}
        canEdit={canCreate}
      />

      {isFormOpen && (
        <PlanFormModal
          initial={createInitial}
          planId={editingId}
          onClose={() => { setIsFormOpen(false); setEditingId(null); }}
          onSaved={onSaved}
        />
      )}
    </div>
  );
}
