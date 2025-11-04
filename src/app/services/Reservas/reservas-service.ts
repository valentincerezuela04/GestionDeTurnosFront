// src/app/core/services/reserva.service.ts
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Reserva } from '../../models/reservas/reserva';
import { API_CONFIG } from '../../config/API';

// DTOs para crear/actualizar (coinciden con los del backend)
export interface CrearReservaClienteDTO {
  salaId: number;
  fechaInicio: string;   // ISO: '2025-11-03T18:00'
  fechaFinal: string;
  tipoPago: string;      // o tu enum TipoPago
}

export interface CrearReservaEmpleadoDTO {
  clienteId: number;
  salaId: number;
  fechaInicio: string;
  fechaFinal: string;
  tipoPago: string;
}

export interface ActualizarReservaDTO {
  reservaId: number;
  descripcion?: string | null;
  fechaInicio: string;
  fechaFinal: string;
  tipoPago: string;
}

@Injectable({ providedIn: 'root' })
export class ReservaService {
  baseUrl = `${API_CONFIG.baseUrl}/reserva`;

  http = inject(HttpClient);


  // READ: todas las reservas activas
  getReservasActivas(): Observable<Reserva[]> {
    return this.http.get<Reserva[]>(`${this.baseUrl}/all/activas`, {
      withCredentials: true,
    });
  }

  // CREATE: cliente logueado crea su reserva
  createReservaCliente(dto: CrearReservaClienteDTO): Observable<Reserva> {
    return this.http.post<Reserva>(`${this.baseUrl}/crear`, dto, {
      withCredentials: true,
    });
  }

  // CREATE: empleado crea una reserva para un cliente
  createReservaEmpleado(dto: CrearReservaEmpleadoDTO): Observable<Reserva> {
    return this.http.post<Reserva>(`${this.baseUrl}/crear/by-empleado`, dto, {
      withCredentials: true,
    });
  }

  // UPDATE: cliente actualiza su reserva
  updateReservaCliente(dto: ActualizarReservaDTO): Observable<Reserva> {
    return this.http.put<Reserva>(`${this.baseUrl}/update`, dto, {
      withCredentials: true,
    });
  }

  // UPDATE: empleado actualiza una reserva
  updateReservaEmpleado(dto: ActualizarReservaDTO): Observable<Reserva> {
    return this.http.put<Reserva>(`${this.baseUrl}/update/by-empleado`, dto, {
      withCredentials: true,
    });
  }

  // CANCELAR: cliente cancela su reserva
  cancelarReservaCliente(id: number): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}/cancelar`, null, {
      withCredentials: true,
    });
  }

  // CANCELAR: empleado cancela una reserva
  cancelarReservaEmpleado(id: number): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}/cancelar/by-empleado`, null, {
      withCredentials: true,
    });
  }


  // DELETE: eliminar reserva (ej: admin)
  deleteReserva(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/eliminar/${id}`, {
      withCredentials: true,
    });
  }


  


}
