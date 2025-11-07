// src/app/components/Reserva/mis-reservas/mis-reservas.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

import { ReservaService } from '../../../services/Reservas/reservas-service';
import { Reserva}  from '../../../models/reservas/reserva';
import { ReservaResponseDTO, ReservaUpdateRequestDTO } from '../../../dto/Reserva';
import { AuthService } from '../../../services/Auth/auth-service';
import { UserInfoResponseDTO } from '../../../dto/user-info-response-dto';
import { CardReserva } from '../card-reserva/card-reserva';

@Component({
  selector: 'app-mis-reservas',
  standalone: true,
  imports: [CommonModule, CardReserva],
  templateUrl: './mis-reservas.html',
  styleUrls: ['./mis-reservas.css'],
})
export class MisReservas {
  private router = inject(Router);
  reservaSrv = inject(ReservaService);
  authService = inject(AuthService);
  reservas: ReservaResponseDTO[] = [];
  usuario: UserInfoResponseDTO | null = null;

  ngOnInit(): void {
    this.obtenerReservas();
    this.UsuarioActual();
  }

  onReservaClick(reserva: ReservaResponseDTO): void {
    // Navegar al componente de detalles con el ID de la reserva
    this.router.navigate(['/reservas', reserva.id, 'details']);
  }

  onNuevaReserva(): void {
    this.router.navigate(['/reservas', 'new']);
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


  // Las funciones de eliminar, cancelar y editar se han movido al componente details-reserva

  


  UsuarioActual(): void {
    this.authService.getUserInfo().pipe(
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
