import React, {  useMemo, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import multiMonthPlugin from '@fullcalendar/multimonth';

const TYPE_COLORS = { meeting:'#2563eb', training:'#7c3aed', event:'#0d9488' };

export default function PlanningCalendar({ mode, plans, onRangeChange, onSelect, onEventDrop, canEdit }) {
  const ref = useRef(null);

  // map Plan -> FullCalendar event
  const events = useMemo(() => plans.map(p => ({
    id: String(p.id),
    title: p.title,
    start: p.start,
    end: p.end,
    backgroundColor: TYPE_COLORS[p.type] || '#64748b',
    borderColor: TYPE_COLORS[p.type] || '#64748b',
    extendedProps: p
  })), [plans]);

  // khi range hiển thị thay đổi
  const datesSet = (arg) => {
    onRangeChange({ from: arg.startStr, to: arg.endStr });
  };

  const eventClick = (info) => onSelect(info.event.extendedProps);
  const eventDrop = (info) => canEdit && onEventDrop(info.event.extendedProps); // bạn có thể gọi PUT ở đây

  return (
    <div className="calendar-wrapper">
      <FullCalendar
        ref={ref}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, multiMonthPlugin]}
        initialView={mode === 'week' ? 'timeGridWeek' : (mode === 'month' ? 'dayGridMonth' : 'multiMonthYear')}
        headerToolbar={false}
        height="auto"
        events={events}
        datesSet={datesSet}
        eventClick={eventClick}
        editable={canEdit}
        droppable={false}
        eventDrop={eventDrop}
        eventResize={eventDrop}
        slotMinTime="07:00:00"
        slotMaxTime="21:00:00"
        displayEventEnd={true}
        dayMaxEventRows={true}
        firstDay={1}
      />
    </div>
  );
}
