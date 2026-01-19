
import { CommonModule } from '@angular/common';
import { Component, ViewChild, signal, inject } from '@angular/core';
import { CalendarService } from '../../../services/Calendar/calendar-service';
import { CalendarDto } from '../../../models/calendarModel';
import { FullCalendarComponent, FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/Auth/auth-service';

@Component({
  selector: 'app-calendar-view',
  standalone: true,
  imports: [CommonModule, FullCalendarModule],
  templateUrl: './calendar-view.html',
  styleUrls: ['./calendar-view.css'],
})
export class CalendarViewComponent {
  @ViewChild('fc') calendar?: FullCalendarComponent;

  loading = signal(true);
  onlyMine = signal(false);

  private router = inject(Router);
  private calSvc = inject(CalendarService);
  private authService = inject(AuthService);

  // --- helpers de rol ---
  private isAdminOrEmpleado(): boolean {
    return this.authService.hasRole('ADMIN', 'EMPLEADO');
  }

  private isCliente(): boolean {
    return this.authService.hasRole('CLIENTE');
  }

    // helper para saber si una reserva es propia (ajustá esto si tenés otro flag)
  private esReservaMia(dto: CalendarDto): boolean {
    return (dto.title ?? '').includes('Tuya');
    // si en el futuro el backend te manda un flag, podés cambiar a:
    // return (dto as any).esMia === true;
  }

  private esReservaFinalizada(dto: CalendarDto): boolean {
    const endValue = dto.end || dto.start;
    if (!endValue) return false;
    const endDate = new Date(endValue);
    if (Number.isNaN(endDate.getTime())) return false;
    return endDate.getTime() < Date.now();
  }

  private getEventClassNames(arg: any): string[] {
  const esFinalizada = !!arg.event.extendedProps['esFinalizada'];
  const esMia = !!arg.event.extendedProps['esMia'];
  if (esFinalizada) {
    return ['cal-event', 'cal-event--done'];
  }
  return esMia
    ? ['cal-event', 'cal-event--mine']
    : ['cal-event', 'cal-event--other'];
}

private buildEventContent(arg: any): { html: string } {
  const title = arg.event.title || '';
  const fmt = (d: Date | null) =>
    d
      ? d.toLocaleTimeString('es-AR', {
          hour: '2-digit',
          minute: '2-digit',
        })
      : '';
  const hora = `${fmt(arg.event.start)} - ${fmt(arg.event.end)}`;
  const cleanTitle = (title.split('-')[0] ?? title).trim();
  const esMia = !!arg.event.extendedProps['esMia'];
  const esFinalizada = !!arg.event.extendedProps['esFinalizada'];

  const badgeHtml = esFinalizada
    ? '<span class="cal-pill cal-pill--done">Finalizada</span>'
    : esMia
      ? '<span class="cal-pill cal-pill--mine">Tu reserva</span>'
      : '<span class="cal-pill cal-pill--busy">Ocupado</span>';

  return {
    html: `
      <div class="fc-event__content">
        <div class="fc-event__top">
          <div class="fc-event__time">${hora}</div>
          <div class="cal-pill-wrap">
            ${badgeHtml}
          </div>
        </div>
        <div class="fc-event__title">${cleanTitle}</div>
      </div>
    `,
  };
}



    calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
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
      this.calSvc.getEvents({ includeFinalizadas: true }).subscribe({
        next: (data) => {
          const filtrados = this.onlyMine()
            ? data.filter((d) => this.esReservaMia(d))
            : data;

          const events: EventInput[] = filtrados.map((d: CalendarDto) => ({
            id: String(d.id),
            title: d.title,
            start: d.start,
            end: d.end,
            extendedProps: {
              description: d.description,
              esMia: this.esReservaMia(d),
              esFinalizada: this.esReservaFinalizada(d),
            },
          }));

          success(events);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Error cargando eventos', err);
          failure(err);
          this.loading.set(false);
        },
      });
    },
    // 👉 acá aplicamos clases según si es tu reserva o no
    eventClassNames: (arg) => this.getEventClassNames(arg),
    // 👉 y este usa el helper de arriba para el HTML del evento
    eventContent: (arg) => this.buildEventContent(arg),
    eventClick: (info) => {
      const id = info.event.id;
      const esMia = info.event.extendedProps['esMia'] as boolean | undefined;

      // ADMIN o EMPLEADO -> pueden ver todas
      if (this.isAdminOrEmpleado()) {
        if (id) {
          this.router.navigate(['/reservas', id, 'details']);
        }
        return;
      }

      // CLIENTE -> solo sus reservas
      if (this.isCliente()) {
        if (!esMia) {
          // Solo puede abrir el detalle de sus propias reservas
          return;
        }
        if (id) {
          this.router.navigate(['/reservas', id, 'details']);
        }
      }
    },
  };


  refetch(): void {
    this.calendar?.getApi().refetchEvents();
  }

  setOnlyMine(checked: boolean): void {
    this.onlyMine.set(checked);
    this.refetch();
  }
}
