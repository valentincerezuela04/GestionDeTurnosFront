import { CommonModule } from '@angular/common';
import { Component, inject, input, output } from '@angular/core';
import { Cliente } from '../../../models/usuarios/cliente';
import { ClientesService } from '../../../services/Clientes/cliente-service';
import { AuthService } from '../../../services/Auth/auth-service';

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
  private readonly clientesService = inject(ClientesService);
  private readonly auth = inject(AuthService);

  eliminando = false;
  error: string | null = null;

  onVolver(): void {
    this.volver.emit();
  }

  get esAdmin(): boolean {
    return this.auth.hasRole('ADMIN');
  }

  eliminarCliente(): void {
    const current = this.cliente();
    if (!this.esAdmin || !current) return;
    if (!confirm('Eliminar definitivamente este cliente?')) return;

    this.eliminando = true;
    this.error = null;

    this.clientesService.delete(current.id).subscribe({
      next: () => {
        this.onVolver();
      },
      error: (err) => {
        console.error(err);
        this.error = 'No se pudo eliminar el cliente.';
        this.eliminando = false;
      },
      complete: () => {
        this.eliminando = false;
      }
    });
  }
}
