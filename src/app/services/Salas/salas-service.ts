import { HttpClient, HttpParams } from '@angular/common/http';
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

   updateDescription(id: number, descripcion: string): Observable<any> {
    const params = new HttpParams()
      .set('id', id.toString())
      .set('descripcion', descripcion);

    // el backend no usa body, así que mandamos null
    return this.http.post(`${this.baseUrl}/update`, null, { params ,responseType: 'text' });
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