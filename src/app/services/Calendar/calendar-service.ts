import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { CalendarDto } from '../../models/calendarModel';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../../config/API';

@Injectable({
  providedIn: 'root',
})
export class CalendarService {
  private baseUrl = `${API_CONFIG.baseUrl}/calendario`;
  http = inject(HttpClient);

  getEvents():Observable<CalendarDto[]> {
    
    return this.http.get<CalendarDto[]>(`${this.baseUrl}/eventos`);
  }
}
