import { CommonModule, DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ReservaResponseDTO } from '../../../dto/Reserva';

@Component({
  selector: 'app-card-reserva',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './card-reserva.html',
  styleUrl: './card-reserva.css',
})
export class CardReserva {
  @Input() reserva!: ReservaResponseDTO;
  @Input() mostrarCliente = false; // true en historial general, false en historial cliente

  @Output() reservaClick = new EventEmitter<ReservaResponseDTO>();

  get estadoClase(): string {
    const estado = this.reserva.estado?.toUpperCase();
    switch (estado) {
      case 'ACTIVO':
        return 'chip-activo';
      case 'CANCELADO':
        return 'chip-cancelado';
      case 'FINALIZADO':
        return 'chip-finalizado';
      default:
        return '';
    }
  }

  onCardClick(): void {
    this.reservaClick.emit(this.reserva);
  }
}
