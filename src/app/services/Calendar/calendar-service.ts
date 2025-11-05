import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { CalendarDto } from '../../models/calendarModel';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CalendarService {
  baseUrl: string = 'http://localhost:3000/api/calendar';
  http = inject(HttpClient);

  getEvents():Observable<CalendarDto[]> {
    return this.http.get<CalendarDto[]>(`${this.baseUrl}/events`);
  }
}
