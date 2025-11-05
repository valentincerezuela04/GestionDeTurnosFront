import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ReservaService } from '../../../services/Reservas/reservas-service';
import { AuthService } from '../../../services/Auth/auth-service';
import { ReservaResponseDTO, ReservaUpdateRequestDTO } from '../../../dto/Reserva';
import { UserInfoResponseDTO } from '../../../dto/UserInfoResponseDTO ';
import { TipoPago } from '../../../models/reservas/tipo-pago';

@Component({
  selector: 'app-details-reserva',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './details-reserva.html',
  styleUrl: './details-reserva.css',
})
export class DetailsReserva {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private reservaSrv = inject(ReservaService);
  private authService = inject(AuthService);

  // Signals para el estado
  readonly reserva = signal<ReservaResponseDTO | null>(null);
  readonly usuario = signal<UserInfoResponseDTO | null>(null);
  readonly isEditing = signal<boolean>(false);
  readonly tipoPagoOptions = signal<TipoPago[]>([TipoPago.EFECTIVO, TipoPago.TARJETA]);

  // Signal para el formulario de edición
  readonly editForm = signal<{
    salaNumero: number;
    fechaInicio: string;
    fechaFinal: string;
    tipoPago: TipoPago;
  }>({
    salaNumero: 0,
    fechaInicio: '',
    fechaFinal: '',
    tipoPago: TipoPago.EFECTIVO
  });

  // Computed values
  readonly puedeEditar = computed(() => {
    const user = this.usuario();
    return user?.role === 'EMPLEADO' || user?.role === 'CLIENTE';
  });

  constructor() {
    // Inicializar datos al cargar el componente
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.cargarReserva(Number(id));
    }
    this.cargarUsuario();
  }

  cargarReserva(id: number): void {
    this.reservaSrv.getReservasActivas().subscribe(reservas => {
      const reservaEncontrada = reservas.find(r => r.id === id);
      this.reserva.set(reservaEncontrada || null);
      
      if (!reservaEncontrada) {
        this.router.navigate(['/reservas']);
        return;
      }

      // Inicializar formulario de edición
      this.editForm.set({
        salaNumero: reservaEncontrada.salaNumero,
        fechaInicio: reservaEncontrada.fechaInicio,
        fechaFinal: reservaEncontrada.fechaFinal,
        tipoPago: reservaEncontrada.tipoPago as TipoPago
      });
    });
  }

  cargarUsuario(): void {
    this.authService.getUserInfo().subscribe({
      next: (user) => this.usuario.set(user as UserInfoResponseDTO)
    });
  }

  startEditing(): void {
    const currentReserva = this.reserva();
    if (!currentReserva) return;

    this.isEditing.set(true);
  }

  cancelEditing(): void {
    this.isEditing.set(false);
    
    // Restaurar valores originales
    const currentReserva = this.reserva();
    if (currentReserva) {
      this.editForm.set({
        salaNumero: currentReserva.salaNumero,
        fechaInicio: currentReserva.fechaInicio,
        fechaFinal: currentReserva.fechaFinal,
        tipoPago: currentReserva.tipoPago as TipoPago
      });
    }
  }

  guardarCambios(): void {
    const currentReserva = this.reserva();
    if (!currentReserva) return;

    const formValues = this.editForm();
    const dto = new ReservaUpdateRequestDTO(
      currentReserva.id,
      formValues.salaNumero,
      formValues.fechaInicio,
      formValues.fechaFinal,
      formValues.tipoPago
    );

    const currentUser = this.usuario();
    const updateReserva = currentUser?.role === 'EMPLEADO'
      ? this.reservaSrv.updateReservaEmpleado(dto)
      : this.reservaSrv.updateReservaCliente(dto);

    updateReserva.subscribe({
      next: () => {
        this.isEditing.set(false);
        this.cargarReserva(currentReserva.id);
      },
      error: (err) => {
        console.error('Error al actualizar la reserva:', err);
        alert('Error al actualizar la reserva');
      }
    });
  }

  cancelarReserva(): void {
    const currentReserva = this.reserva();
    if (!currentReserva || !confirm('¿Cancelar la reserva?')) return;

    const currentUser = this.usuario();
    const cancelarReserva = currentUser?.role === 'EMPLEADO'
      ? this.reservaSrv.cancelarReservaEmpleado(currentReserva.id)
      : this.reservaSrv.cancelarReservaCliente(currentReserva.id);

    cancelarReserva.subscribe({
      next: () => {
        alert('Reserva cancelada con éxito');
        this.router.navigate(['/reservas']);
      },
      error: (err) => {
        console.error('Error al cancelar la reserva:', err);
        alert('Error al cancelar la reserva');
      }
    });
  }

  eliminarReserva(): void {
    const currentReserva = this.reserva();
    if (!currentReserva || !confirm('¿Eliminar definitivamente la reserva?')) return;
    
    this.reservaSrv.deleteReserva(currentReserva.id).subscribe({
      next: () => {
        alert('Reserva eliminada con éxito');
        this.router.navigate(['/reservas']);
      },
      error: (err) => {
        console.error('Error al eliminar la reserva:', err);
        alert('Error al eliminar la reserva');
      }
    });
  }

  // Métodos de actualización del formulario
  updateSalaNumero(value: number): void {
    this.editForm.update(form => ({...form, salaNumero: value}));
  }

  updateFechaInicio(value: string): void {
    this.editForm.update(form => ({...form, fechaInicio: value}));
  }

  updateFechaFinal(value: string): void {
    this.editForm.update(form => ({...form, fechaFinal: value}));
  }

  updateTipoPago(value: TipoPago): void {
    this.editForm.update(form => ({...form, tipoPago: value}));
  }

  volver(): void {
    this.router.navigate(['/reservas']);
  }
  
  // Modelo temporal para la edición
}

