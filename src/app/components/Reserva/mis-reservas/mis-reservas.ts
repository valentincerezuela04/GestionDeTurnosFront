// src/app/components/Reserva/mis-reservas/mis-reservas.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

import { ReservaService } from '../../../services/Reservas/reservas-service';
import { Reserva}  from '../../../models/reservas/reserva';
import { ReservaResponseDTO, ReservaUpdateRequestDTO } from '../../../dto/Reserva';
import { AuthService } from '../../../services/Auth/auth-service';
import { UserInfoResponseDTO } from '../../../dto/UserInfoResponseDTO ';

@Component({
  selector: 'app-mis-reservas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mis-reservas.html',
})
export class MisReservas {

  //Mostrar las reservas activas del usuario
  reservaSrv = inject(ReservaService);
  authService = inject(AuthService);
  reservas: ReservaResponseDTO[] = [];
  usuario: UserInfoResponseDTO | null = null;

  ngOnInit(): void {
    this.obtenerReservas();
    this.UsuarioActual();
  }
  

  obtenerReservas(): void {
    this.reservaSrv.getReservasActivas().pipe(
      catchError((error) => {
        console.error('Error al obtener las reservas:', error);
        return of([]); // Retorna un array vacío en caso de error
      })
    ).subscribe((data: ReservaResponseDTO[]) => {
      this.reservas = data;
    });
    
  }


  eliminar(id: number): void {
    if (!confirm('¿Eliminar definitivamente la reserva?')) return;
    this.reservaSrv.deleteReserva(id).subscribe({
      next: () => this.obtenerReservas()
    });
  }


  cancelar(id: number): void {
    if (!confirm('¿Cancelar la reserva?')) return;

    if(this.usuario?.role === 'CLIENTE'){
      this.reservaSrv.cancelarReservaCliente(id).subscribe({
      next: () => this.obtenerReservas()
    });
    }

    if(this.usuario?.role === 'EMPLEADO'){
      this.reservaSrv.cancelarReservaEmpleado(id).subscribe({
      next: () => this.obtenerReservas()
    });
    }
    
  }


  editar(id: number): void {
    // Buscar la reserva por id
    const reserva = this.reservas.find(r => r.id === id);
    if (!reserva) {
      alert('Reserva no encontrada');
      return;
    }

    // Pedimos al usuario nuevos valores vía prompt (UI simple). Si deja vacío, mantenemos el valor actual.
    const fechaInicio = prompt('Nueva fecha de inicio (YYYY-MM-DDTHH:mm:ss)', reserva.fechaInicio) || reserva.fechaInicio;
    const fechaFinal = prompt('Nueva fecha final (YYYY-MM-DDTHH:mm:ss)', reserva.fechaFinal) || reserva.fechaFinal;

    // El DTO espera salaId; el DTO de respuesta solo tiene salaNumero. Pedimos al usuario el id de la sala o usamos salaNumero como fallback.
    const salaIdInput = prompt('ID de sala (dejar vacío para usar el número de sala actual)', String(reserva.salaNumero));
    const salaId = salaIdInput ? Number(salaIdInput) : Number(reserva.salaNumero);

    // Tipo de pago: si el usuario deja vacío, mantenemos el actual
    const tipoPagoInput = prompt('Tipo de pago (ej: EFECTIVO, TARJETA). Dejar vacío para mantener', String(reserva.tipoPago));
    const tipoPago = tipoPagoInput ? (tipoPagoInput as any) : reserva.tipoPago;

    const dto = new ReservaUpdateRequestDTO(id, salaId, fechaInicio, fechaFinal, tipoPago);

    // Llamada al servicio según el rol del usuario
    if (this.usuario?.role === 'CLIENTE') {
      this.reservaSrv.updateReservaCliente(dto).subscribe({
        next: () => {
          alert('Reserva actualizada');
          this.obtenerReservas();
        },
        error: (err) => {
          console.error('Error al actualizar reserva:', err);
          alert('Error actualizando la reserva');
        }
      });
      return;
    }

    if (this.usuario?.role === 'EMPLEADO') {
      this.reservaSrv.updateReservaEmpleado(dto).subscribe({
        next: () => {
          alert('Reserva actualizada');
          this.obtenerReservas();
        },
        error: (err) => {
          console.error('Error al actualizar reserva:', err);
          alert('Error actualizando la reserva');
        }
      });
      return;
    }

    // Si no hay rol conocido, intentamos por defecto la ruta de cliente
    this.reservaSrv.updateReservaCliente(dto).subscribe({
      next: () => {
        alert('Reserva actualizada');
        this.obtenerReservas();
      },
      error: (err) => {
        console.error('Error al actualizar reserva:', err);
        alert('Error actualizando la reserva');
      }
    });
  }

  


  UsuarioActual(): void {
    this.authService.ObtenerUsuarioActual().pipe(
      catchError((error) => {
        console.error('Error al obtener la información del usuario:', error);
        return of(null as UserInfoResponseDTO | null); // Retorna null en caso de error
      })
    ).subscribe({
      next: (data) => {
        this.usuario = data as UserInfoResponseDTO | null;
      }
    });
  }


}
