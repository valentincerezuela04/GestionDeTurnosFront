import { Component, OnInit } from '@angular/core';
import { Reserva } from '../../../models/reservas/reserva';
import { ReservaService } from '../../../services/Reservas/reservas-service';
import { DatePipe, CommonModule } from '@angular/common';

@Component({
  selector: 'app-mis-reservas',
  templateUrl: './mis-reservas.html',
  styleUrls: ['./mis-reservas.css'],
  imports:[
    CommonModule,
    DatePipe
  ]
})
export class MisReservas implements OnInit {

  reservas: Reserva[] = [];
  loading = false;
  error = '';

  constructor(private reservaService: ReservaService) {}

  ngOnInit(): void {
    this.cargarReservas();
  }

  cargarReservas(): void {
    this.loading = true;
    this.error = '';

    this.reservaService.getReservasActivas().subscribe({
      next: (data) => {
        this.reservas = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar tus reservas.';
        this.loading = false;
      }
    });
  }

  cancelarReserva(id: number): void {
    if (!confirm('¿Seguro que querés cancelar esta reserva?')) {
      return;
    }

    this.reservaService.cancelarReservaCliente(id).subscribe({
      next: () => this.cargarReservas(),
      error: () => alert('No se pudo cancelar la reserva')
    });
  }
}
