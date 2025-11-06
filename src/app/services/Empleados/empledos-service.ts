import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_CONFIG } from '../../config/API';
import { EmpleadoResponseDTO } from '../../dto/Empleado/empleado-response-dto';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
// Centraliza las operaciones HTTP para administrar empleados: listar, crear, obtener, actualizar y eliminar.
export class EmpledosService {
  baseUrl = `${API_CONFIG.baseUrl}/empleados`;
  http = inject(HttpClient);

  getAll(): Observable<EmpleadoResponseDTO[]> {
    return this.http.get<EmpleadoResponseDTO[]>(`${this.baseUrl}`, { withCredentials: true });
  }

  getById(id: number): Observable<EmpleadoResponseDTO> {
    return this.http.get<EmpleadoResponseDTO>(`${this.baseUrl}/${id}`, { withCredentials: true });
  }

  createEmpleado(empleadoData: Partial<EmpleadoResponseDTO>): Observable<EmpleadoResponseDTO> {
    return this.http.post<EmpleadoResponseDTO>(`${this.baseUrl}`, empleadoData, { withCredentials: true });
  }

  deleteById(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, { withCredentials: true });
  }

  updateEmpleado(id: number, empleadoData: Partial<EmpleadoResponseDTO>) {
    return this.http.put<EmpleadoResponseDTO>(`${this.baseUrl}/${id}`, empleadoData, { withCredentials: true });
  }

  // Metodos legacy para compatibilidad con codigo existente
  getEmpleados(): Observable<EmpleadoResponseDTO[]> {
    return this.getAll();
  }

  getEmpleadoById(id: number): Observable<EmpleadoResponseDTO> {
    return this.getById(id);
  }

  deleteEmpleado(id: number): Observable<void> {
    return this.deleteById(id);
  }

  update(id: number, empleadoData: Partial<EmpleadoResponseDTO>) {
    return this.updateEmpleado(id, empleadoData);
  }

  create(empleadoData: Partial<EmpleadoResponseDTO>): Observable<EmpleadoResponseDTO> {
    return this.createEmpleado(empleadoData);
  }
}
