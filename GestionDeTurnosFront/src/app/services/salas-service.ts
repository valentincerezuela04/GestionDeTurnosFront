import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { SalaDTO } from '../models/models';

@Injectable({
  providedIn: 'root',
})
export class SalasService {
  private readonly baseUrl = 'http://localhost:8080/api/salas';
  private readonly http = inject(HttpClient);

  getAll(): Observable<SalaDTO[]> {
    return this.http.get<SalaDTO[]>(this.baseUrl)
  }

  getById(id:number):Observable<SalaDTO>{
    return this.http.get<SalaDTO>(`${this.baseUrl}/${id}`)
  }

  create(sala:Partial<SalaDTO>):Observable<SalaDTO>{
    return this.http.post<SalaDTO>(this.baseUrl,sala)
  }

  updateDescription(sala:SalaDTO):Observable<SalaDTO>{
    return this.http.put<SalaDTO>(`${this.baseUrl}/update`,sala)
  }

  delete(id:number){
    return this.http.delete<void>(`${this.baseUrl}/${id}`)
  }

    canDelete(id: number) {    
    return this.http.get<boolean>(`${this.baseUrl}/${id}/can-delete`);
  }


    getClienteActivas() {   
    return this.http.get<any[]>(`${this.baseUrl}/cliente/activas`);
  }
}
