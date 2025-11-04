import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { Sala } from '../../models/sala';
@Injectable({
  providedIn: 'root',
})
export class SalasService {
  private readonly baseUrl = 'http://localhost:8080/api/salas';
  private readonly http = inject(HttpClient);

  getAll(): Observable<Sala[]> {
    return this.http.get<Sala[]>(this.baseUrl)
  }

  getById(id:number):Observable<Sala>{
    return this.http.get<Sala>(`${this.baseUrl}/${id}`)
  }

  create(sala:Partial<Sala>):Observable<Sala>{
    return this.http.post<Sala>(this.baseUrl,sala)
  }

  updateDescription(sala:Sala):Observable<Sala>{
    return this.http.put<Sala>(`${this.baseUrl}/update`,sala)
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