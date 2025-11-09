import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { Cliente } from '../../../models/usuarios/cliente';
import { ClientesListComponent } from '../cliente-list/cliente-list';
import { DetailsClienteComponent } from '../details-cliente/details-cliente';

@Component({
  selector: 'app-clientes-page',
  standalone: true,
  imports: [CommonModule, ClientesListComponent, DetailsClienteComponent],
  templateUrl: './clientes-page.html',
  styleUrl: './clientes-page.css',
})
export class ClientesPageComponent {
  private readonly seleccionado = signal<Cliente | null>(null);

  readonly clienteSeleccionado = this.seleccionado.asReadonly();

  onSeleccion(cliente: Cliente): void {
    this.seleccionado.set(cliente);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  volverAlListado(): void {
    this.seleccionado.set(null);
  }
}
