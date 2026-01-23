import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ReservaService } from '../../../services/Reservas/reservas-service';
import { AuthService } from '../../../services/Auth/auth-service';
import { ReservaResponseDTO, ReservaUpdateRequestDTO } from '../../../dto/Reserva';
import { UserInfoResponseDTO } from '../../../dto/user-info-response-dto';
import { TipoPago } from '../../../models/reservas/tipo-pago';
import { SalasService } from '../../../services/Salas/salas-service';
import { SalaDTO as Sala } from '../../../models/sala';
import { UiAlertService } from '../../../services/Ui-alert/ui-alert';
import { UiConfirmService } from '../../../services/Ui-confirm/ui-confirm';

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
  private salasService = inject(SalasService);
  private uiAlert = inject(UiAlertService);
  private uiConfirm = inject(UiConfirmService);

  readonly reserva = signal<ReservaResponseDTO | null>(null);
  readonly usuario = signal<UserInfoResponseDTO | null>(null);
  readonly isEditing = signal<boolean>(false);
  readonly tipoPagoOptions = signal<TipoPago[]>([
    TipoPago.EFECTIVO,
    TipoPago.MERCADO_PAGO,
  ]);
  readonly salas = signal<Sala[]>([]);

  readonly editForm = signal<{
    salaId: number | null;
    fechaInicio: string;
    fechaFinal: string;
    tipoPago: TipoPago;
  }>({
    salaId: null,
    fechaInicio: '',
    fechaFinal: '',
    tipoPago: TipoPago.EFECTIVO,
  });

  readonly esEmpleado = computed(() => {
    const rol = (this.usuario()?.role ?? '').toString().toUpperCase();
    return rol === 'EMPLEADO';
  });

  readonly esPendientePago = computed(() => {
    const estado = (this.reserva()?.estado ?? '').toString().toUpperCase();
    return estado === 'PENDIENTE_CONFIRMACION_PAGO';
  });

  readonly puedeEditar = computed(() => {
    const user = this.usuario();
    return user?.role === 'EMPLEADO' || user?.role === 'CLIENTE';
  });

  readonly accionesHabilitadas = computed(() => {
    return this.esReservaActiva() || this.esPendientePago();
  });

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.cargarReserva(Number(id));
    }
    this.cargarUsuario();
    this.cargarSalas();
  }

  cargarReserva(id: number): void {
    this.reservaSrv.getReservasActivas().subscribe({
      next: (reservas) => {
        const reservaEncontrada = reservas.find((r) => r.id === id);
        if (reservaEncontrada) {
          this.setReservaData(reservaEncontrada);
          return;
        }
        this.buscarEnHistorial(id);
      },
      error: (err: unknown) => {
        console.error('Error al cargar reservas activas:', err as any);
        this.buscarEnHistorial(id);
      },
    });
  }

  private cargarSalas(): void {
    this.salasService.getAll().subscribe({
      next: (salas) => {
        this.salas.set(salas ?? []);
        this.syncSalaSeleccion();
      },
      error: (err: unknown) => {
        console.error('Error al cargar las salas:', err as any);
        this.uiAlert.show({
          variant: 'error',
          tone: 'soft',
          title: 'Error',
          message: 'Error al cargar las salas.',
          timeoutMs: 5000,
        });
      },
    });
  }

  cargarUsuario(): void {
    this.authService.getUserInfo().subscribe({
      next: (user) => this.usuario.set(user as UserInfoResponseDTO),
      error: (err: unknown) => {
        console.error('Error al cargar el usuario:', err as any);
        this.uiAlert.show({
          variant: 'error',
          tone: 'soft',
          title: 'Error',
          message: 'No se pudo cargar la información del usuario.',
          timeoutMs: 5000,
        });
      },
    });
  }

  startEditing(): void {
    const currentReserva = this.reserva();
    if (!currentReserva || !this.esReservaActiva(currentReserva)) return;
    this.isEditing.set(true);
  }

  cancelEditing(): void {
    this.isEditing.set(false);

    const currentReserva = this.reserva();
    if (currentReserva) {
      this.editForm.set({
        salaId: this.getSalaIdFromNumero(currentReserva.salaNumero),
        fechaInicio: currentReserva.fechaInicio,
        fechaFinal: currentReserva.fechaFinal,
        tipoPago: currentReserva.tipoPago as TipoPago,
      });
    }
  }

  guardarCambios(): void {
    const currentReserva = this.reserva();
    if (!currentReserva || !this.esReservaActiva(currentReserva)) {
      this.isEditing.set(false);
      return;
    }

    const formValues = this.editForm();

    if (!formValues.salaId) {
      this.uiAlert.show({
        variant: 'warning',
        tone: 'soft',
        title: 'Warning alert',
        message: 'Seleccioná una sala válida.',
        timeoutMs: 4500,
      });
      return;
    }

    const dto = new ReservaUpdateRequestDTO(
      currentReserva.id,
      formValues.salaId,
      formValues.fechaInicio,
      formValues.fechaFinal,
      formValues.tipoPago
    );

    const currentUser = this.usuario();
    const updateReserva =
      currentUser?.role === 'EMPLEADO'
        ? this.reservaSrv.updateReservaEmpleado(dto)
        : this.reservaSrv.updateReservaCliente(dto);

    updateReserva.subscribe({
      next: () => {
        this.isEditing.set(false);
        this.uiAlert.show({
          variant: 'success',
          tone: 'soft',
          title: 'Success alert',
          message: 'Reserva actualizada correctamente.',
          timeoutMs: 3000,
        });
        this.cargarReserva(currentReserva.id);
      },
      error: (err: unknown) => {
        console.error('Error al actualizar la reserva:', err as any);
        this.uiAlert.show({
          variant: 'error',
          tone: 'soft',
          title: 'Error',
          message: 'Error al actualizar la reserva.',
          timeoutMs: 5000,
        });
      },
    });
  }

  async cancelarReserva(): Promise<void> {
    const currentReserva = this.reserva();
    if (!currentReserva || !this.esReservaActiva(currentReserva)) return;
    const confirmacion = await this.uiConfirm.open({
      variant: 'warning',
      tone: 'soft',
      title: 'Confirmar cancelacion',
      message: 'Cancelar la reserva?',
      confirmText: 'Cancelar',
      cancelText: 'Volver',
    });
    if (!confirmacion) return;

    const currentUser = this.usuario();
    const cancelarReserva =
      currentUser?.role === 'EMPLEADO'
        ? this.reservaSrv.cancelarReservaEmpleado(currentReserva.id)
        : this.reservaSrv.cancelarReservaCliente(currentReserva.id);

    cancelarReserva.subscribe({
      next: () => {
        this.uiAlert.show({
          variant: 'success',
          tone: 'soft',
          title: 'Success alert',
          message: 'Reserva cancelada con éxito.',
          timeoutMs: 3000,
        });
        this.router.navigate(['/reservas']);
      },
      error: (err: unknown) => {
        console.error('Error al cancelar la reserva:', err as any);
        this.uiAlert.show({
          variant: 'error',
          tone: 'soft',
          title: 'Error',
          message: 'Error al cancelar la reserva.',
          timeoutMs: 5000,
        });
      },
    });
  }

  async confirmarPagoEmpleado(): Promise<void> {
    const currentReserva = this.reserva();
    if (!currentReserva || !this.esEmpleado() || !this.esPendientePago()) return;

    const ok = await this.uiConfirm.open({
      variant: 'info',
      tone: 'soft',
      title: 'Confirmar pago',
      message: '¿Confirmar el pago y activar la reserva?',
      confirmText: 'Confirmar',
      cancelText: 'Volver',
    });
    if (!ok) return;

    this.reservaSrv.confirmarPago(currentReserva.id).subscribe({
      next: () => {
        this.uiAlert.show({
          variant: 'success',
          tone: 'soft',
          title: 'Success alert',
          message: 'Pago confirmado. Reserva activada.',
          timeoutMs: 3000,
        });
        this.cargarReserva(currentReserva.id);
      },
      error: (err: unknown) => {
        console.error('Error al confirmar pago:', err as any);
        this.uiAlert.show({
          variant: 'error',
          tone: 'soft',
          title: 'Error',
          message: 'No se pudo confirmar el pago.',
          timeoutMs: 5000,
        });
      },
    });
  }

  async rechazarPagoEmpleado(): Promise<void> {
    const currentReserva = this.reserva();
    if (!currentReserva || !this.esEmpleado() || !this.esPendientePago()) return;

    const ok = await this.uiConfirm.open({
      variant: 'warning',
      tone: 'soft',
      title: 'Rechazar pago',
      message: 'Esto cancelará la reserva. ¿Continuar?',
      confirmText: 'Rechazar',
      cancelText: 'Volver',
    });
    if (!ok) return;

    this.reservaSrv.cancelarReservaEmpleado(currentReserva.id).subscribe({
      next: () => {
        this.uiAlert.show({
          variant: 'success',
          tone: 'soft',
          title: 'Success alert',
          message: 'Pago rechazado. Reserva cancelada.',
          timeoutMs: 3000,
        });
        this.reserva.update((r) => (r ? { ...r, estado: 'CANCELADO' as any } : r));
        this.cargarReserva(currentReserva.id);
      },
      error: (err: unknown) => {
        console.error('Error al rechazar pago:', err as any);
        this.uiAlert.show({
          variant: 'error',
          tone: 'soft',
          title: 'Error',
          message: 'No se pudo rechazar el pago.',
          timeoutMs: 5000,
        });
      },
    });
  }

  async eliminarReserva(): Promise<void> {
    const currentReserva = this.reserva();
    if (!currentReserva) return;

    const confirmacion = await this.uiConfirm.open({
      variant: 'error',
      tone: 'soft',
      title: 'Confirmar eliminacion',
      message: 'Eliminar definitivamente la reserva?',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
    });
    if (!confirmacion) return;

    this.reservaSrv.deleteReserva(currentReserva.id).subscribe({
      next: () => {
        this.uiAlert.show({
          variant: 'success',
          tone: 'soft',
          title: 'Success alert',
          message: 'Reserva eliminada con éxito.',
          timeoutMs: 3000,
        });
        this.router.navigate(['/reservas']);
      },
      error: (err: unknown) => {
        console.error('Error al eliminar la reserva:', err as any);
        this.uiAlert.show({
          variant: 'error',
          tone: 'soft',
          title: 'Error',
          message: 'Error al eliminar la reserva.',
          timeoutMs: 5000,
        });
      },
    });
  }

  updateSalaId(value: number | string): void {
    const parsed = typeof value === 'string' ? Number(value) : value;
    if (Number.isNaN(parsed)) return;
    this.editForm.update((form) => ({ ...form, salaId: parsed }));
  }

  updateFechaInicio(value: string): void {
    this.editForm.update((form) => ({ ...form, fechaInicio: value }));
  }

  updateFechaFinal(value: string): void {
    this.editForm.update((form) => ({ ...form, fechaFinal: value }));
  }

  updateTipoPago(value: TipoPago): void {
    this.editForm.update((form) => ({ ...form, tipoPago: value }));
  }

  volver(): void {
    this.router.navigate(['/reservas']);
  }

  formatTipoPago(tipo: ReservaResponseDTO['tipoPago']): string {
    if (!tipo) return 'N/A';
    return tipo.toString().replace(/_/g, ' ');
  }

  estadoClase(estado: ReservaResponseDTO['estado']): string {
    const normalized = (estado ?? '').toString().toUpperCase();
    if (normalized === 'ACTIVO') return 'chip-activo';
    if (normalized === 'PENDIENTE_CONFIRMACION_PAGO') return 'chip-pendiente';
    if (normalized === 'CANCELADO') return 'chip-cancelado';
    if (normalized === 'FINALIZADO') return 'chip-finalizado';
    return '';
  }

  private getSalaIdFromNumero(numero: number): number | null {
    const sala = this.salas().find((s) => s.numero === numero);
    return sala ? sala.id : null;
  }

  private syncSalaSeleccion(): void {
    const currentReserva = this.reserva();
    if (!currentReserva) return;
    const salaId = this.getSalaIdFromNumero(currentReserva.salaNumero);
    if (salaId != null && this.editForm().salaId !== salaId) {
      this.editForm.update((form) => ({ ...form, salaId }));
    }
  }

  private setReservaData(reservaEncontrada: ReservaResponseDTO): void {
    this.reserva.set(reservaEncontrada);
    if (!this.esReservaActiva(reservaEncontrada)) {
      this.isEditing.set(false);
    }
    this.editForm.set({
      salaId: this.getSalaIdFromNumero(reservaEncontrada.salaNumero),
      fechaInicio: reservaEncontrada.fechaInicio,
      fechaFinal: reservaEncontrada.fechaFinal,
      tipoPago: reservaEncontrada.tipoPago as TipoPago,
    });
    this.syncSalaSeleccion();
  }

  private buscarEnHistorial(id: number): void {
    const usuarioLocal = this.usuario() ?? (this.authService.user() as any);
    const rol = (usuarioLocal?.role ?? usuarioLocal?.rol ?? '').toString().toUpperCase();
    const isAdminOrEmpleado = rol === 'ADMIN' || rol === 'EMPLEADO';

    const source$ = isAdminOrEmpleado
      ? this.reservaSrv.getHistorialGeneral()
      : usuarioLocal?.id
        ? this.reservaSrv.getHistorialCliente(usuarioLocal.id)
        : null;

    if (!source$) {
      this.uiAlert.show({
        variant: 'warning',
        tone: 'soft',
        title: 'Warning alert',
        message: 'No se pudo determinar el historial del usuario. Volviendo al listado.',
        timeoutMs: 4500,
      });
      this.router.navigate(['/reservas']);
      return;
    }

    source$.subscribe({
      next: (reservas) => {
        const reservaEncontrada = (reservas ?? []).find((r) => r.id === id);
        if (!reservaEncontrada) {
          this.uiAlert.show({
            variant: 'warning',
            tone: 'soft',
            title: 'Warning alert',
            message: 'No se encontró la reserva.',
            timeoutMs: 4500,
          });
          this.router.navigate(['/reservas']);
          return;
        }
        this.setReservaData(reservaEncontrada);
      },
      error: (err: unknown) => {
        console.error('Error al buscar la reserva en historial:', err as any);
        this.uiAlert.show({
          variant: 'error',
          tone: 'soft',
          title: 'Error',
          message: 'Error al buscar la reserva en el historial.',
          timeoutMs: 5000,
        });
        this.router.navigate(['/reservas']);
      },
    });
  }

  private esReservaActiva(reserva: ReservaResponseDTO | null = this.reserva()): boolean {
    return (reserva?.estado ?? '').toString().toUpperCase() === 'ACTIVO';
  }
}
