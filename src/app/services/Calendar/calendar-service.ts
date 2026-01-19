import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { CalendarDto } from '../../models/calendarModel';
import { Observable, catchError, forkJoin, map, of, throwError } from 'rxjs';
import { API_CONFIG } from '../../config/API';

@Injectable({
  providedIn: 'root',
})
export class CalendarService {
  private baseUrl = `${API_CONFIG.baseUrl}/calendario`;
  http = inject(HttpClient);

  getEvents(options?: { includeFinalizadas?: boolean }): Observable<CalendarDto[]> {
    const includeFinalizadas = options?.includeFinalizadas ?? true;

    if (!includeFinalizadas) {
      return this.http.get<CalendarDto[]>(`${this.baseUrl}/eventos`);
    }

    const params = new HttpParams().set('incluirFinalizadas', 'true');
    return this.http
      .get<CalendarDto[]>(`${this.baseUrl}/eventos`, { params })
      .pipe(
        catchError((err) =>
          this.getEventosActivosYFinalizados().pipe(
            catchError(() => throwError(() => err))
          )
        )
      );
  }

  private getEventosActivosYFinalizados(): Observable<CalendarDto[]> {
    const activos$ = this.http.get<CalendarDto[]>(`${this.baseUrl}/eventos`);
    const finalizados$ = this.http
      .get<CalendarDto[]>(`${this.baseUrl}/eventos/finalizados`)
      .pipe(catchError(() => of([])));

    return forkJoin([activos$, finalizados$]).pipe(
      map(([activos, finalizados]) => this.mergeEventos(activos, finalizados))
    );
  }

  private mergeEventos(activos: CalendarDto[], finalizados: CalendarDto[]): CalendarDto[] {
    const mapById = new Map<number, CalendarDto>();
    for (const evento of [...activos, ...finalizados]) {
      mapById.set(evento.id, evento);
    }
    return Array.from(mapById.values());
  }
}
