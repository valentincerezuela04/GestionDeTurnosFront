import { CommonModule } from '@angular/common';
import { Component, ViewChild, signal } from '@angular/core';
import { CalendarService } from '../../../services/Calendar/calendar-service';
import { CalendarDto } from '../../../models/calendarModel';

import { FullCalendarComponent, FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';

@Component({
  selector: 'app-calendar-view',
  standalone: true,
  imports: [CommonModule, FullCalendarModule],
  templateUrl: './calendar-view.html',
  styleUrls: ['./calendar-view.css'], // <- ojo acá
})
export class CalendarViewComponent {
  @ViewChild('fc') calendar?: FullCalendarComponent;

  loading = signal(true);
  onlyMine = signal(false);

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin], // <- clave
    initialView: 'dayGridWeek',
    locale: 'es',
    locales: [esLocale],
    firstDay: 1,
    height: 'auto',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,dayGridWeek,timeGridDay',
    },
    events: (info, success, failure) => {
      this.loading.set(true);
      this.calSvc.getEvents().subscribe({
        next: (data) => {
          const filtered = this.onlyMine()
            ? data.filter(d => (d.title ?? '').includes('Tuya'))
            : data;

          const events: EventInput[] = filtered.map((d: CalendarDto) => ({
            id: String(d.id),
            title: d.title,
            start: d.start,
            end:   d.end,
            extendedProps: { description: d.description }
          }));

          success(events);
          this.loading.set(false);
        },
        error: (err) => { console.error('Error cargando eventos', err); failure(err); this.loading.set(false); }
      });
    },
    eventContent: (arg) => {
      const title = arg.event.title || '';
      const fmt = (d: Date | null) => d ? d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }) : '';
      const hora = `<b>${fmt(arg.event.start)} - ${fmt(arg.event.end)}</b>`;
      let styled = title;
      if (title.includes('Tuya'))    styled = title.replace('Tuya', '<span style="color:#28a745;">Tuya</span>');
      else if (title.includes('Ocupado')) styled = title.replace('Ocupado', '<span style="color:#a7288a;">Ocupado</span>');
      return { html: `<div>${hora}<br>${styled}</div>` };
    },
    eventClick: (info) => {
      const desc = (info.event.extendedProps as any)?.description;
      if (desc) alert(desc);
    }
  };

  constructor(private calSvc: CalendarService) {}

  refetch(): void { this.calendar?.getApi().refetchEvents(); }
  setOnlyMine(checked: boolean): void { this.onlyMine.set(checked); this.refetch(); }
}
