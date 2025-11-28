import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

import { ReservaService } from '../../../services/Reservas/reservas-service';
import { AuthService } from '../../../services/Auth/auth-service';
import { SalasService } from '../../../services/Salas/salas-service';
import { ClientesService } from '../../../services/Clientes/cliente-service';

import { ReservaRequestByClienteDTO } from '../../../dto/Reserva/';
import { ReservaRequestByEmpleadoDTO } from '../../../dto/Reserva/reservaRequestbyEmpleadoDTO ';
import { UserInfoResponseDTO } from '../../../dto/user-info-response-dto';
import { SalaDTO as Sala } from '../../../models/sala';
import { Cliente } from '../../../models/usuarios/cliente';
import { TipoPago } from '../../../models/reservas/tipo-pago';

@Component({
  selector: 'app-reserva-form',
  templateUrl: 'reserva-form.html',
  styleUrls: ['./reserva-form.css'],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, MatSnackBarModule],
})
export class ReservaFormComponent implements OnInit {
  form!: FormGroup;
  editMode = false;
  reservaId?: number;

  usuario: UserInfoResponseDTO | null = null;
  salas: Sala[] = [];
  clientes: Cliente[] = [];
  tipoPagos: TipoPago[] = [TipoPago.MERCADO_PAGO, TipoPago.EFECTIVO, TipoPago.TARJETA, TipoPago.TRANSFERENCIA];

  // Tarifas base por hora segun tamano de sala
  private readonly tarifaPorHoraPorSize: Record<string, number> = {
    PEQUENA: 500,
    MEDIANA: 8000,
    GRANDE: 1200,
  };

  private fb = inject(FormBuilder);
  private reservaService = inject(ReservaService);
  authService = inject(AuthService);
  salasService = inject(SalasService);
  clientesService = inject(ClientesService);
  router = inject(Router);
  private snackBar = inject(MatSnackBar);

  ngOnInit(): void {
    this.obtenerUsuarioActual();

    // Form + validador de rango (fin > inicio)
    this.form = this.fb.group(
      {
        salaId: [null, Validators.required],
        clienteId: [null], // requerido si EMPLEADO
        fechaInicio: [null, Validators.required],
        fechaFinal: [null, Validators.required],
        tipoPago: [TipoPago.MERCADO_PAGO, Validators.required],
        descripcion: [''], // opcional (solo UI si tu back no lo usa)
        monto: [{ value: 0, disabled: true }, [Validators.required]], // solo lectura en UI
      },
      { validators: [this.dateRangeValidator] }
    );

    this.setupMontoAuto();

    this.salasService.getAll().subscribe({
      next: (salas) => {
        this.salas = salas ?? [];
        this.recalcularMonto();
      },
      error: () => this.snackBar.open('No se pudieron cargar las salas', 'Cerrar', { duration: 2500 }),
    });
  }

  // ===================== SUBMIT =====================

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.value;

    // Asegurar numericos
    const salaId = Number(v.salaId);
    if (Number.isNaN(salaId)) {
      this.snackBar.open('Selecciona una sala valida', 'Cerrar', { duration: 2500 });
      return;
    }

    const clienteId = v.clienteId != null ? Number(v.clienteId) : null;
    if (this.isEmpleado() && (clienteId == null || Number.isNaN(clienteId))) {
      this.snackBar.open('Ingresa un cliente valido', 'Cerrar', { duration: 2500 });
      return;
    }

    // Como monto esta disabled, hay que usar getRawValue()
    const raw = this.form.getRawValue();
    const monto = raw.monto ?? 0;
    const tipoPagoSeleccionado = (v.tipoPago as TipoPago) ?? TipoPago.EFECTIVO;

    // Fechas para el back
    const payloadBase = {
      salaId,
      fechaInicio: this.formatDateForApi(v.fechaInicio),
      fechaFinal: this.formatDateForApi(v.fechaFinal),
      tipoPago: tipoPagoSeleccionado,
      monto,
    };

    const onOk = () => {
      this.snackBar.open('Reserva creada correctamente', 'Cerrar', {
        duration: 3000,
        panelClass: ['success-snackbar'],
      });
      setTimeout(() => this.router.navigate(['/reservas']), 800);
    };

    const onError = (err: any) => {
      console.error('API error body =>', err?.error);

      const rawErr = (err?.error?.message || err?.error || '').toString();
      const isSolape = err?.status === 409 || /solap|ocupad/i.test(rawErr);

      this.snackBar.open(
        isSolape ? 'La sala no esta disponible en ese horario.' : rawErr || 'No se pudo crear la reserva',
        'Cerrar',
        {
          duration: 3500,
          panelClass: [isSolape ? 'warn-snackbar' : 'error-snackbar'],
        }
      );
    };

    if (this.usuario?.role === 'CLIENTE') {
      const dto = new ReservaRequestByClienteDTO(
        payloadBase.salaId,
        payloadBase.fechaInicio,
        payloadBase.fechaFinal,
        payloadBase.tipoPago!,
        payloadBase.monto
      );

      if (tipoPagoSeleccionado === TipoPago.MERCADO_PAGO) {
        this.reservaService.createReservaCliente(dto).subscribe({
          next: (reserva: any) => {
            this.snackBar.open('Reserva creada, preparando Mercado Pago...', 'Cerrar', {
              duration: 2000,
              panelClass: ['success-snackbar'],
            });

            this.reservaService.generarLinkPago(reserva.id).subscribe({
              next: (resp: any) => {
                const initPoint = resp?.initPoint;
                if (!initPoint) {
                  this.snackBar.open('No se pudo obtener el link de pago.', 'Cerrar', {
                    duration: 3500,
                    panelClass: ['warn-snackbar'],
                  });
                  return;
                }

                window.open(initPoint, '_blank');
                this.snackBar.open('Abrimos Mercado Pago para completar el pago', 'Cerrar', {
                  duration: 3200,
                });
                setTimeout(() => this.router.navigate(['/reservas']), 1000);
              },
              error: (err) => {
                console.error('Error al generar link de pago:', err?.error || err);
                this.snackBar.open(
                  'Reserva creada, pero no pudimos generar el link de Mercado Pago',
                  'Cerrar',
                  { duration: 3500, panelClass: ['error-snackbar'] }
                );
              },
            });
          },
          error: onError,
        });
        return;
      }

      this.reservaService.createReservaCliente(dto).subscribe({ next: onOk, error: onError });
      return;
    }

    if (this.usuario?.role === 'EMPLEADO') {
      const dto: ReservaRequestByEmpleadoDTO = { ...payloadBase, clienteId: clienteId! };
      this.reservaService.createReservaEmpleado(dto).subscribe({ next: onOk, error: onError });
    } else {
      this.snackBar.open('No se pudo determinar el rol del usuario', 'Cerrar', { duration: 2500 });
    }
  }

  // ===================== USUARIO / ROLES =====================

  obtenerUsuarioActual(): void {
    this.authService.getUserInfo().subscribe({
      next: (data) => {
        this.usuario = data as UserInfoResponseDTO;

        // Si es EMPLEADO, clienteId es requerido + cargamos lista de clientes
        if (this.isEmpleado()) {
          this.form?.get('clienteId')?.addValidators([Validators.required]);
          this.form?.get('clienteId')?.updateValueAndValidity();
          this.cargarClientes();
        }
      },
      error: (err) => console.error('Error al obtener el usuario actual:', err),
    });
  }

  isEmpleado(): boolean {
    return this.usuario?.role === 'EMPLEADO';
  }

  private cargarClientes(): void {
    this.clientesService.getAll().subscribe({
      next: (clientes) => (this.clientes = clientes ?? []),
      error: () => this.snackBar.open('No se pudieron cargar los clientes', 'Cerrar', { duration: 2500 }),
    });
  }

  // ===================== VALIDADORES / HELPERS =====================

  abrirPicker(input: HTMLInputElement | null | undefined): void {
    if (!input) return;
    const pickerFn = (input as any).showPicker;
    if (typeof pickerFn === 'function') {
      pickerFn.call(input);
    } else {
      input.focus();
    }
  }

  private dateRangeValidator = (group: FormGroup) => {
    const i = group.get('fechaInicio')?.value;
    const f = group.get('fechaFinal')?.value;
    if (!i || !f) return null;
    return new Date(f) > new Date(i) ? null : { dateRange: true };
  };

  // "YYYY-MM-DDTHH:mm"
  private formatDateForApi(value: any): string {
    if (!value) return value;
    if (typeof value === 'string') {
      return value.length >= 16 ? value.slice(0, 16) : value;
    }
    const d = new Date(value);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(
      d.getMinutes()
    )}`;
  }

  /** Se suscribe a cambios del form y recalcula el monto. */
  private setupMontoAuto(): void {
    this.form.valueChanges.subscribe(() => {
      this.recalcularMonto();
    });
  }

  /** Calcula el monto actual y lo pisa en el form (monto es control disabled). */
  private recalcularMonto(): void {
    const monto = this.calcularMontoDesdeForm();
    this.form.get('monto')?.setValue(monto, { emitEvent: false });
  }

  /** Logica de calculo:
   *  - busca la sala y su size
   *  - diferencia de horas (minimo 1)
   *  - si el inicio es sabado o domingo +20%
   */
  private calcularMontoDesdeForm(): number {
    const v = this.form.value;

    const salaId = Number(v.salaId);
    const sala = this.salas.find((s) => s.id === salaId);
    if (!sala) return 0;

    if (!v.fechaInicio || !v.fechaFinal) return 0;

    const inicio = new Date(v.fechaInicio);
    const fin = new Date(v.fechaFinal);

    if (isNaN(inicio.getTime()) || isNaN(fin.getTime()) || fin <= inicio) {
      return 0;
    }

    const size = sala.salaSize as Sala['salaSize'];
    const sizeKey = typeof size === 'string' ? size.replace('Ñ', 'N') : size;
    const tarifaBase = this.tarifaPorHoraPorSize[sizeKey];
    if (!tarifaBase) return 0;

    const diffMs = fin.getTime() - inicio.getTime();
    const horas = diffMs / (1000 * 60 * 60);
    const horasRedondeadas = Math.max(1, Math.ceil(horas)); // minimo 1h

    let monto = tarifaBase * horasRedondeadas;

    // 0 = domingo, 6 = sabado
    const dia = inicio.getDay();
    const esFinDeSemana = dia === 0 || dia === 6;
    if (esFinDeSemana) {
      monto = monto * 1.2; // +20%
    }

    return Math.round(monto); // redondeamos al entero mas cercano
  }
}
