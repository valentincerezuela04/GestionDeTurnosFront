import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';

import { ReservaService } from '../../../services/Reservas/reservas-service';
import { ReservaResponseDTO } from '../../../dto/Reserva';
import { CardReserva } from '../card-reserva/card-reserva';

@Component({
  selector: 'app-historial-general',
  standalone: true,
  imports: [CommonModule, CardReserva],
  templateUrl: './historial-general.html',
  styleUrl: './historial-general.css',
})
export class HistorialGeneral implements OnInit {
  private readonly reservaSrv = inject(ReservaService);
  private readonly router = inject(Router);

  historial: ReservaResponseDTO[] = [];
  loading = true;
  error: string | null = null;

  ngOnInit(): void {
    this.cargarHistorial();
  }

  private cargarHistorial(): void {
    this.loading = true;
    this.error = null;

    this.reservaSrv.getHistorialGeneral().subscribe({
      next: (reservas) => {
        this.historial = reservas ?? [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar historial general:', err);
        this.error = 'No se pudo cargar el historial general de reservas.';
        this.loading = false;
      },
    });
  }

  onReservaClick(reserva: ReservaResponseDTO): void {
    this.router.navigate(['/reservas', reserva.id, 'details']);
  }
}
