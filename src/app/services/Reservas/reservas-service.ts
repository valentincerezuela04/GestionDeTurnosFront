// src/app/core/services/reserva.service.ts
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../../config/API';

import {
  ReservaRequestByClienteDTO,
  ReservaRequestByEmpleadoDTO,
  ReservaUpdateRequestDTO,
  ReservaResponseDTO
} from '../../dto/Reserva';

@Injectable({ providedIn: 'root' })
export class ReservaService {
  // Ajuste a la ruta real del controller: /api/reserva
  baseUrl = `${API_CONFIG.baseUrl}/reserva`;

  private readonly http = inject(HttpClient);

  // READ: todas las reservas activas segund el rol del usuario
  getReservasActivas(): Observable<ReservaResponseDTO[]> {
    return this.http.get<ReservaResponseDTO[]>(`${this.baseUrl}/all/activas`);
  }

  // CREATE: cliente logueado crea su reserva
  createReservaCliente(dto: ReservaRequestByClienteDTO): Observable<ReservaResponseDTO> {
    return this.http.post<ReservaResponseDTO>(`${this.baseUrl}/crear`, dto);
  }

  // CREATE: empleado crea una reserva para un cliente
  createReservaEmpleado(dto: ReservaRequestByEmpleadoDTO): Observable<ReservaResponseDTO> {
    return this.http.post<ReservaResponseDTO>(`${this.baseUrl}/crear/by-empleado`, dto);
  }

  // UPDATE: cliente actualiza su reserva
  updateReservaCliente(dto: ReservaUpdateRequestDTO): Observable<ReservaResponseDTO> {
    return this.http.put<ReservaResponseDTO>(`${this.baseUrl}/update`, dto);
  }

  // UPDATE: empleado actualiza una reserva
  updateReservaEmpleado(dto: ReservaUpdateRequestDTO): Observable<ReservaResponseDTO> {
    return this.http.put<ReservaResponseDTO>(`${this.baseUrl}/update/by-empleado`, dto);
  }

  // CANCELAR: cliente cancela su reserva
  cancelarReservaCliente(id: number): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}/cancelar`, null);
  }

  // CANCELAR: empleado cancela una reserva
  cancelarReservaEmpleado(id: number): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}/cancelar/by-empleado`, null);
  }

  // DELETE: eliminar reserva (ej: admin)
  deleteReserva(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/eliminar/${id}`);
  }
}
