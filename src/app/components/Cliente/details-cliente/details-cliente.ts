import { CommonModule } from '@angular/common';
import { Component, inject, input, output } from '@angular/core';
import { Cliente } from '../../../models/usuarios/cliente';
import { ClientesService } from '../../../services/Clientes/cliente-service';
import { AuthService } from '../../../services/Auth/auth-service';
import { UiConfirmService } from '../../../services/Ui-confirm/ui-confirm';

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
  private readonly uiConfirm = inject(UiConfirmService);

  eliminando = false;
  error: string | null = null;

  onVolver(): void {
    this.volver.emit();
  }

  get esAdmin(): boolean {
    return this.auth.hasRole('ADMIN');
  }

  async eliminarCliente(): Promise<void> {
    const current = this.cliente();
    if (!this.esAdmin || !current) return;
    const confirmacion = await this.uiConfirm.open({
      variant: 'error',
      tone: 'soft',
      title: 'Confirmar eliminacion',
      message: 'Eliminar definitivamente este cliente?',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
    });
    if (!confirmacion) return;

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
