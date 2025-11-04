import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../../config/API';
import { Cliente } from '../../models/usuarios/cliente';

@Injectable({
  providedIn: 'root'
})
export class ClientesService {

  private baseUrl = `${API_CONFIG.baseUrl}/cliente`;

  http = inject(HttpClient);

  // GET http://localhost:8080/api/cliente/all
  getAll(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(`${this.baseUrl}/all`, { withCredentials: true });
  }

  // GET http://localhost:8080/api/cliente/{id}
  getById(id: number): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.baseUrl}/${id}`, { withCredentials: true });
  }

  // POST http://localhost:8080/api/cliente
  create(cliente: Cliente): Observable<Cliente> {
    return this.http.post<Cliente>(this.baseUrl, cliente, { withCredentials: true });
  }

  // PUT http://localhost:8080/api/cliente/update
  update(cliente: Cliente): Observable<Cliente> {
    return this.http.put<Cliente>(`${this.baseUrl}/update`, cliente, { withCredentials: true });
  }

  // DELETE http://localhost:8080/api/cliente/{id}
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, { withCredentials: true });
  }
}
