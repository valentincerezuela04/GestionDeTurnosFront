
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
    // ej: return dto.esMia === true;
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
      this.calSvc.getEvents().subscribe({
        next: (data) => {
          const filtrados = this.onlyMine()
            ? data.filter(d => this.esReservaMia(d))
            : data;

          const events: EventInput[] = filtrados.map((d: CalendarDto) => ({
            id: String(d.id),
            title: d.title,
            start: d.start,
            end: d.end,
            extendedProps: {
              description: d.description,
              esMia: this.esReservaMia(d),
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
    eventContent: (arg) => {
      const title = arg.event.title || '';
      const fmt = (d: Date | null) =>
        d ? d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }) : '';
      const hora = `${fmt(arg.event.start)} - ${fmt(arg.event.end)}`;
      const cleanTitle = (title.split('-')[0] ?? title).trim();

      const badges: string[] = [];
      if (title.includes('Tuya')) {
        badges.push('<span class="cal-pill cal-pill--mine">Tuya</span>');
      } else if (title.includes('Ocupado')) {
        badges.push('<span class="cal-pill cal-pill--busy">Ocupado</span>');
      }

      const badgeHtml = badges.length ? `<span class="cal-pill-wrap">${badges.join('')}</span>` : '';
      return {
        html: `<div class="fc-event__content"><div class="fc-event__time">${hora}</div><div class="fc-event__title">${cleanTitle}${badgeHtml}</div></div>`,
      };
    },
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
          // opcional:
          // alert('Solo podés ver el detalle de tus propias reservas.');
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
