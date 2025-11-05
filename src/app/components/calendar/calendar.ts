import { Component, inject } from '@angular/core';
import { CalendarService } from '../../services/Calendar/calendar-service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-calendar',
  imports: [],
  templateUrl: './calendar.html',
  styleUrl: './calendar.css',
})
export class Calendar {
  serv = inject(CalendarService);

  eventos = toSignal(this.serv.getEvents(),{ initialValue: [] } );

}
