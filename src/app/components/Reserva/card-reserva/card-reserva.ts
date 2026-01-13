import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ReservaResponseDTO } from '../../../dto/Reserva';

@Component({
  selector: 'app-card-reserva',
  standalone: true,
  imports: [CommonModule, DatePipe, CurrencyPipe],
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
      return `
        bg-[color:rgba(46,229,157,0.18)]
        border-[color:rgba(46,229,157,0.45)]
        text-[color:rgba(13,120,82,1)]
        dark:text-[color:rgba(46,229,157,0.95)]
      `;
    case 'CANCELADO':
      return `
        bg-[color:rgba(255,77,109,0.16)]
        border-[color:rgba(255,77,109,0.45)]
        text-[color:rgba(165,19,49,1)]
        dark:text-[color:rgba(255,77,109,0.95)]
      `;
    case 'FINALIZADO':
      return `
        bg-[color:rgba(124,92,255,0.14)]
        border-[color:rgba(124,92,255,0.40)]
        text-[color:rgba(74,56,204,1)]
        dark:text-[color:rgba(190,180,255,0.95)]
      `;
    default:
      return `
        bg-[color:rgba(124,92,255,0.10)]
        border-[color:rgba(124,92,255,0.25)]
        text-[var(--text)]
      `;
  }
}


  onCardClick(): void {
    this.reservaClick.emit(this.reserva);
  }

  formatTipoPago(tipo: ReservaResponseDTO['tipoPago']): string {
    if (!tipo) {
      return 'N/A';
    }
    return tipo.toString().replace('_', ' ');
  }
}
