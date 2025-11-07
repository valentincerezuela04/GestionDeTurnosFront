import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { Cliente } from '../../../models/usuarios/cliente';

@Component({
  selector: 'app-details-cliente',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './details-cliente.html',
  styleUrl: './details-cliente.css',
})
export class DetailsClienteComponent {
  readonly cliente = input<Cliente | null>(null);
  readonly volver = output<void>();

  onVolver(): void {
    this.volver.emit();
  }
}
