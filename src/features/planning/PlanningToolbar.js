import React, { useEffect, useState } from 'react';
import api from '../utils/api';


export default function PlanningToolbar({ mode, onModeChange, filters, onFiltersChange, canCreate, onCreateWeek, onCreateMonth, onCreateWork }) {

  const [units, setUnits] = useState([]);
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    api.get('/units').then(r => setUnits(r.data || []));   // nếu chưa có endpoint, tạm để []
    api.get('/rooms').then(r => setRooms(r.data || []));
  }, []);

  return (
    <div className="planning-toolbar">
      <div className="left">
        <div className={`tab ${mode==='week'?'active':''}`} onClick={()=>onModeChange('week')}>Tuần</div>
        <div className={`tab ${mode==='month'?'active':''}`} onClick={()=>onModeChange('month')}>Tháng</div>
        <div className={`tab ${mode==='quarter'?'active':''}`} onClick={()=>onModeChange('quarter')}>Quý</div>
      </div>

      <div className="center">
        <select value={filters.unit_id} onChange={e=>onFiltersChange({...filters, unit_id: e.target.value})}>
          <option value="">Tất cả đơn vị</option>
          {units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>
        <select value={filters.room_id} onChange={e=>onFiltersChange({...filters, room_id: e.target.value})}>
          <option value="">Tất cả phòng</option>
          {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>
        <select value={filters.type} onChange={e=>onFiltersChange({...filters, type: e.target.value})}>
          <option value="">Tất cả loại</option>
          <option value="meeting">Họp</option>
          <option value="training">Đào tạo</option>
          <option value="event">Sự kiện</option>
        </select>
      </div>

      <div className="right">
      {canCreate && (
         <div className="btn-split">
            <button className="btn btn--primary" onClick={onCreateWork}>+ Đăng ký lịch</button>
           <button className="btn btn--primary" onClick={onCreateWeek}>Đăng ký lịch tuần</button>
           <button className="btn btn--primary btn--ghost" onClick={onCreateMonth}>Đăng ký lịch tháng</button>
         </div>
       )}
      </div>
    </div>
  );
}
