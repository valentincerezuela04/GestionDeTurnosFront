import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';

import { ReservaService } from '../../../services/Reservas/reservas-service';
import { AuthService } from '../../../services/Auth/auth-service';
import { ReservaResponseDTO } from '../../../dto/Reserva';
import { UserInfoResponseDTO } from '../../../dto/user-info-response-dto';
import { CardReserva } from '../card-reserva/card-reserva';

@Component({
  selector: 'app-historial-cliente',
  standalone: true,
  imports: [CommonModule, CardReserva],
  templateUrl: './historial-cliente.html',
  styleUrl: './historial-cliente.css',
})
export class HistorialCliente implements OnInit {
  private readonly reservaSrv = inject(ReservaService);
  private readonly authSrv = inject(AuthService);
  private readonly router = inject(Router);

  historial: ReservaResponseDTO[] = [];
  loading = true;
  error: string | null = null;

  ngOnInit(): void {
    this.cargarUsuarioYHistorial();
  }

  private cargarUsuarioYHistorial(): void {
    this.authSrv.getUserInfo().subscribe({
      next: (user) => {
        const usuario = user as UserInfoResponseDTO;
        const idCliente = usuario.id ?? this.authSrv.user()?.id;

        if (!idCliente) {
          this.error = 'No se pudo determinar el usuario actual.';
          this.loading = false;
          return;
        }

        this.cargarHistorial(idCliente);
      },
      error: (err) => {
        console.error('Error al obtener el usuario actual:', err);
        const fallback = this.authSrv.user();
        if (fallback?.id) {
          this.cargarHistorial(fallback.id);
        } else {
          this.error = 'No se pudo determinar el usuario actual.';
          this.loading = false;
        }
      },
    });
  }

  private cargarHistorial(clienteId: number): void {
    this.reservaSrv.getHistorialCliente(clienteId).subscribe({
      next: (reservas) => {
        this.historial = reservas ?? [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar historial del cliente:', err);
        this.error = 'No se pudo cargar tu historial de reservas.';
        this.loading = false;
      },
    });
  }

  onReservaClick(reserva: ReservaResponseDTO): void {
    this.router.navigate(['/reservas', reserva.id, 'details']);
  }
}
