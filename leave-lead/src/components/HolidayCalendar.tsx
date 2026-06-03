import FullCalendar from '@fullcalendar/react';
import daygridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import frLocale from '@fullcalendar/core/locales/fr';

interface Props {
  holidays: any[];
  onDateClick?: (date: string) => void;   // Clic sur une case vide (Ajout)
  onEventClick?: (holidayId: number) => void; // Clic sur un jour férié (Modif/Suppr)
}

export const HolidayCalendar = ({ holidays, onDateClick, onEventClick }: Props) => {
  
  // On ne mappe plus que les jours fériés
  const events = holidays.map(h => ({
    id: h.id.toString(),
    title: `🎉 ${h.nom}`,
    start: h.date,
    allDay: true,
    backgroundColor: '#eef2ff',
    textColor: '#4338ca',
    borderColor: '#c7d2fe',
    extendedProps: { type: 'holiday' }
  }));

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
      <FullCalendar
        plugins={[daygridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        locale={frLocale}
        events={events}
        editable={false}
        selectable={true}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth'
        }}
        dateClick={(info) => onDateClick?.(info.dateStr)}
        eventClick={(info) => {
          if (info.event.extendedProps.type === 'holiday') {
            onEventClick?.(Number(info.event.id));
          }
        }}
        height="auto"
      />
    </div>
  );
};