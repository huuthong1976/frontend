// -----------------------------------------------------------------------------
// PlanFormModal.js (clean no-unused-vars: removed employees state/call)
// -----------------------------------------------------------------------------
import React, { useEffect, useState } from 'react';
import api from '../../utils/api';

export default function PlanFormModal({ initial, planId, onClose, onSaved }) {
  // ===== Master data =====
  const [units, setUnits] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [templates, setTemplates] = useState([]); // templates động từ API
  const [tplKey, setTplKey] = useState('');

  // ===== Form state =====
  const [form, setForm] = useState(() => ({
    title: '', type: 'meeting',
    start: '', end: '',
    unit_id: '', room_id: '',
    participants: [],
    visibility: 'public',
    ...(initial || {})
  }));

  // Load master & templates (KHÔNG tải employees để tránh no-unused-vars)
  useEffect(() => {
    api.get('/units').then(r => setUnits(r.data || []));
    api.get('/rooms').then(r => setRooms(r.data || []));
    api.get('/planning-templates').then(r => setTemplates(r.data || []));

    const now = new Date(); const end = new Date(now.getTime() + 60*60*1000);
    setForm(f => ({
      ...f,
      start: f.start || now.toISOString(),
      end:   f.end   || end.toISOString()
    }));
  }, []);

  // Chọn template -> set title/type/end + resolve participants theo DB
  const applyTemplate = async (key) => {
    setTplKey(key);
    const conf = templates.find(t => t.key === key);
    if (!conf) return;

    // meta: title/type/duration
    setForm(prev => {
      const start = prev.start ? new Date(prev.start) : new Date();
      const end = new Date(start.getTime() + (conf.duration_min || 60) * 60000);
      return { ...prev, title: conf.title, type: conf.type, end: end.toISOString() };
    });

    // resolve participants theo unit hiện tại (hoặc default_unit_id của template)
    const unit_id = (form.unit_id || conf.default_unit_id) || '';
    try {
      const r = await api.get(`/planning-templates/${key}/resolve`, { params: { unit_id } });
      setForm(prev => ({ ...prev, participants: r.data?.participants || [] }));
    } catch {
      // im lặng nếu lỗi
    }
  };

  // Đổi đơn vị sau khi đã chọn template -> resolve lại
  useEffect(() => {
    if (!tplKey) return;
    applyTemplate(tplKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.unit_id]);

  const handleSubmit = async () => {
    const payload = {
      title: (form.title || '').trim(),
      type: form.type,
      start: form.start,
      end:   form.end,
      unit_id: form.unit_id ? Number(form.unit_id) : null,
      room_id: form.room_id ? Number(form.room_id) : null,
      participants: form.participants || [],
      visibility: form.visibility || 'public',
    };
    if (planId) await api.put(`/plans/${planId}`, payload);
    else        await api.post('/plans', payload);
    onSaved?.();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={e=>e.stopPropagation()}>
        <h3>{planId ? 'Sửa kế hoạch' : 'Tạo kế hoạch'}</h3>

        <div className="modal-body grid2">
          {/* Template động */}
          <div className="full">
            <label>Mẫu sự kiện</label>
            <select value={tplKey} onChange={(e)=>applyTemplate(e.target.value)}>
              <option value="">-- Chọn mẫu --</option>
              {templates.map(t => (
                <option key={t.key} value={t.key}>
                  {t.label} • {t.duration_min}′
                </option>
              ))}
            </select>
          </div>

          <div className="full">
            <label>Tiêu đề</label>
            <input value={form.title} onChange={e=>setForm({...form, title:e.target.value})} />
          </div>

          <div>
            <label>Loại</label>
            <select value={form.type} onChange={e=>setForm({...form, type:e.target.value})}>
              <option value="meeting">Họp</option>
              <option value="training">Đào tạo</option>
              <option value="event">Sự kiện</option>
            </select>
          </div>

          <div>
            <label>Đơn vị</label>
            <select value={form.unit_id||''} onChange={e=>setForm({...form, unit_id:e.target.value})}>
              <option value="">Chọn đơn vị</option>
              {units.map(u=> <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>

          <div>
            <label>Phòng</label>
            <select value={form.room_id||''} onChange={e=>setForm({...form, room_id:e.target.value})}>
              <option value="">Chọn phòng</option>
              {rooms.map(r=> <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>

          <div>
            <label>Bắt đầu</label>
            <input
              type="datetime-local"
              value={form.start ? new Date(form.start).toISOString().slice(0,16) : ''}
              onChange={e=>{
                const iso = new Date(e.target.value).toISOString();
                if (tplKey) {
                  const conf = templates.find(t=>t.key===tplKey);
                  const end = new Date(new Date(iso).getTime() + (conf?.duration_min||60)*60000);
                  setForm({...form, start: iso, end: end.toISOString()});
                } else {
                  setForm({...form, start: iso});
                }
              }}
            />
          </div>

          <div>
            <label>Kết thúc</label>
            <input
              type="datetime-local"
              value={form.end ? new Date(form.end).toISOString().slice(0,16) : ''}
              onChange={e=>setForm({...form, end: new Date(e.target.value).toISOString()})}
            />
          </div>

          <div className="full">
            <label>Thành viên (IDs, phân cách bằng dấu phẩy)</label>
            <input
              placeholder="ví dụ: 6,8,15"
              value={(form.participants||[]).join(',')}
              onChange={e=>setForm({
                ...form,
                participants: e.target.value
                  .split(',')
                  .map(s=>Number(s.trim()))
                  .filter(Boolean)
              })}
            />
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn" onClick={onClose}>Hủy</button>
          <button className="btn btn--primary" onClick={handleSubmit}>
            {planId ? 'Cập nhật' : 'Lưu'}
          </button>
        </div>
      </div>
    </div>
  );
}
