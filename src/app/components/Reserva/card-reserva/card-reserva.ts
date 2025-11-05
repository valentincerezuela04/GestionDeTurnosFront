import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReservaResponseDTO } from '../../../dto/Reserva';

@Component({
  selector: 'app-card-reserva',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card-reserva.html',
  styleUrl: './card-reserva.css',
})
export class CardReserva {
  @Input() reserva!: ReservaResponseDTO;
  @Output() reservaClick = new EventEmitter<ReservaResponseDTO>();

  onCardClick() {
    this.reservaClick.emit(this.reserva);
  }
}
