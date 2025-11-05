import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { EmpleadoResponseDTO } from '../../../dto/Empleado/empleado-response-dto';

@Component({
  selector: 'app-card-empleados',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card-empleados.html',
  styleUrl: './card-empleados.css',
})
// Representa una tarjeta resumida de un empleado y emite un evento cuando el usuario solicita ver sus detalles.
export class CardEmpleados {
  @Input({ required: true }) empleado!: EmpleadoResponseDTO;
  @Output() viewDetails = new EventEmitter<EmpleadoResponseDTO>();

  handleViewDetails(event: MouseEvent): void {
    event.stopPropagation();
    this.viewDetails.emit(this.empleado);
  }

  onCardClick(): void {
    this.viewDetails.emit(this.empleado);
  }
}
