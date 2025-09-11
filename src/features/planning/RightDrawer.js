// -----------------------------------------------------------------------------
// RightDrawer.js
// -----------------------------------------------------------------------------
import React from 'react';
import api from 'utils/api';

export default function RightDrawer({ plan, onClose, onUpdated, onEdit, canEdit }) {
  if (!plan) return null;

  const handleDelete = async () => {
    await api.delete(`/plans/${plan.id}`);
    onUpdated?.();
  };

  return (
    <div className="drawer" onClick={onClose}>
      <div className="drawer__panel" onClick={(e)=>e.stopPropagation()}>
        <div className="drawer__header">
          <h4>{plan.title}</h4>
          <button className="btn" onClick={onClose}>Đóng</button>
        </div>

        <div className="drawer__body">
          <p><b>Thời gian:</b> {new Date(plan.start).toLocaleString()} → {new Date(plan.end).toLocaleString()}</p>
          <p><b>Đơn vị:</b> {plan.unit_id || '-'}</p>
          <p><b>Phòng:</b> {plan.room_id || '-'}</p>
          <p><b>Thành viên:</b> {(plan.participants||[]).join(', ') || '-'}</p>
          <p><b>Loại:</b> {plan.type || '-'}</p>
        </div>

        {canEdit && (
          <div className="drawer__actions">
            {onEdit && <button className="btn" onClick={()=>onEdit(plan)}>Sửa</button>}
            <button className="btn btn--danger" onClick={handleDelete}>Xóa</button>
          </div>
        )}
      </div>
    </div>
  );
}
