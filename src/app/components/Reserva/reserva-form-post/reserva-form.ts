import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { ReservaService } from '../../../services/Reservas/reservas-service';
import { AuthService } from '../../../services/Auth/auth-service';
import { SalasService } from '../../../services/Salas/salas-service';
import { ClientesService } from '../../../services/Clientes/cliente-service';
import { UiAlertService } from '../../../services/Ui-alert/ui-alert';

import { ReservaRequestByClienteDTO } from '../../../dto/Reserva/';
import { ReservaRequestByEmpleadoDTO } from '../../../dto/Reserva/reservaRequestbyEmpleadoDTO ';
import { UserInfoResponseDTO } from '../../../dto/user-info-response-dto';
import { SalaDTO as Sala, SalaSize } from '../../../models/sala';
import { Cliente } from '../../../models/usuarios/cliente';
import { TipoPago } from '../../../models/reservas/tipo-pago';

@Component({
  selector: 'app-reserva-form',
  templateUrl: 'reserva-form.html',
  styleUrls: ['./reserva-form.css'],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
})
export class ReservaFormComponent implements OnInit {
  form!: FormGroup;
  editMode = false;
  reservaId?: number;

  usuario: UserInfoResponseDTO | null = null;
  salas: Sala[] = [];
  clientes: Cliente[] = [];
  tipoPagos: TipoPago[] = [TipoPago.MERCADO_PAGO, TipoPago.EFECTIVO];

  // Tarifas base por hora segun tamaño de sala
  // CAMBIO: tipado con SalaSize y sin trucos raros con strings
  private readonly tarifaPorHoraPorSize: Record<SalaSize, number> = {
    PEQUEÑA: 500,
    MEDIANA: 800,
    GRANDE: 1200,
  };

  private fb = inject(FormBuilder);
  private reservaService = inject(ReservaService);
  authService = inject(AuthService);
  salasService = inject(SalasService);
  clientesService = inject(ClientesService);
  router = inject(Router);
  private uiAlert = inject(UiAlertService);

  minFechaInicio!: string;

  private initMinFechaInicio(): void {
    const hoy = new Date();
    const year = hoy.getFullYear();
    const month = String(hoy.getMonth() + 1).padStart(2, '0');
    const day = String(hoy.getDate()).padStart(2, '0');

    // Desde las 00:00 del día de hoy (independiente de la hora actual)
    this.minFechaInicio = `${year}-${month}-${day}T00:00`;
  }

  ngOnInit(): void {
    this.obtenerUsuarioActual();
    this.initMinFechaInicio();

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
      error: () =>
        this.uiAlert.show({
          variant: 'error',
          tone: 'soft',
          title: 'Error',
          message: 'No se pudieron cargar las salas',
          timeoutMs: 2500,
        }),
    });
  }

  // ===================== SUBMIT =====================

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.value;

    // Asegurar numéricos
    const salaId = Number(v.salaId);
    if (Number.isNaN(salaId)) {
      this.uiAlert.show({
        variant: 'warning',
        tone: 'soft',
        title: 'Warning alert',
        message: 'Selecciona una sala valida',
        timeoutMs: 2500,
      });
      return;
    }

    const clienteId = v.clienteId != null ? Number(v.clienteId) : null;
    if (this.isEmpleado() && (clienteId == null || Number.isNaN(clienteId))) {
      this.uiAlert.show({
        variant: 'warning',
        tone: 'soft',
        title: 'Warning alert',
        message: 'Ingresa un cliente valido',
        timeoutMs: 2500,
      });
      return;
    }

    // Como monto está disabled, hay que usar getRawValue()
    const raw = this.form.getRawValue();
    const monto = raw.monto ?? 0;
    const tipoPagoSeleccionado = (v.tipoPago as TipoPago) ?? TipoPago.EFECTIVO;

    // CAMBIO: si es MERCADO_PAGO, no permitimos monto <= 0 (evitamos unit_price invalid)
    if (tipoPagoSeleccionado === TipoPago.MERCADO_PAGO && monto <= 0) {
      this.uiAlert.show({
        variant: 'error',
        tone: 'soft',
        title: 'Error',
        message: 'El monto calculado es invalido. Verifica sala y rango de fechas.',
        timeoutMs: 3500,
      });
      return;
    }

    // Fechas para el back
    const payloadBase = {
      salaId,
      fechaInicio: this.formatDateForApi(v.fechaInicio),
      fechaFinal: this.formatDateForApi(v.fechaFinal),
      tipoPago: tipoPagoSeleccionado,
      monto,
    };

    const onOk = () => {
      this.uiAlert.show({
        variant: 'success',
        tone: 'soft',
        title: 'Success alert',
        message: 'Reserva creada correctamente',
        timeoutMs: 3000,
      });
      setTimeout(() => this.router.navigate(['/reservas']), 800);
    };

    const onError = (err: any) => {
      console.error('API error body =>', err?.error);

      const rawErr =
        (typeof err?.error?.message === 'string' ? err.error.message : '') ||
        (typeof err?.error?.error === 'string' ? err.error.error : '') ||
        (typeof err?.error === 'string' ? err.error : '') ||
        '';
      const isSolape = err?.status === 409 || /solap|ocupad/i.test(rawErr);

      this.uiAlert.show({
        variant: isSolape ? 'warning' : 'error',
        tone: 'soft',
        title: isSolape ? 'Warning alert' : 'Error',
        message: isSolape
          ? 'La sala no esta disponible en ese horario.'
          : rawErr || 'No se pudo crear la reserva',
        timeoutMs: 3500,
      });
    };

    // ===================== FLUJO CLIENTE =====================

    if (this.usuario?.role === 'CLIENTE') {
      const dto = new ReservaRequestByClienteDTO(
        payloadBase.salaId,
        payloadBase.fechaInicio,
        payloadBase.fechaFinal,
        payloadBase.tipoPago!,
        payloadBase.monto
      );

      // Si es MERCADO_PAGO -> crear reserva + generar link de pago
      if (tipoPagoSeleccionado === TipoPago.MERCADO_PAGO) {
        this.reservaService.createReservaCliente(dto).subscribe({
          next: (reserva: any) => {
            this.uiAlert.show({
              variant: 'success',
              tone: 'soft',
              title: 'Success alert',
              message: 'Reserva creada, preparando Mercado Pago...',
              timeoutMs: 2000,
            });

            this.reservaService.generarLinkPago(reserva.id).subscribe({
              next: (resp: any) => {
                const initPoint = resp?.initPoint;
                if (!initPoint) {
                  this.uiAlert.show({
                    variant: 'warning',
                    tone: 'soft',
                    title: 'Warning alert',
                    message: 'No se pudo obtener el link de pago.',
                    timeoutMs: 3500,
                  });
                  return;
                }

                // Abre MP en otra pestana
                window.open(initPoint, '_blank');
                this.uiAlert.show({
                  variant: 'info',
                  tone: 'soft',
                  title: 'Info',
                  message: 'Abrimos Mercado Pago para completar el pago',
                  timeoutMs: 3200,
                });
                setTimeout(() => this.router.navigate(['/reservas']), 1000);
              },
              error: (err) => {
                console.error('Error al generar link de pago:', err?.error || err);
                this.uiAlert.show({
                  variant: 'error',
                  tone: 'soft',
                  title: 'Error',
                  message: 'Reserva creada, pero no pudimos generar el link de Mercado Pago',
                  timeoutMs: 3500,
                });
              },
            });
          },
          error: onError,
        });
        return;
      }

      // Si es EFECTIVO -> solo crear reserva y listo (como querías)
      this.reservaService.createReservaCliente(dto).subscribe({ next: onOk, error: onError });
      return;
    }

    // ===================== FLUJO EMPLEADO =====================

    if (this.usuario?.role === 'EMPLEADO') {
      const dto: ReservaRequestByEmpleadoDTO = { ...payloadBase, clienteId: clienteId! };
      this.reservaService.createReservaEmpleado(dto).subscribe({ next: onOk, error: onError });
    } else {
      this.uiAlert.show({
        variant: 'error',
        tone: 'soft',
        title: 'Error',
        message: 'No se pudo determinar el rol del usuario',
        timeoutMs: 2500,
      });
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
      error: () =>
        this.uiAlert.show({
          variant: 'error',
          tone: 'soft',
          title: 'Error',
          message: 'No se pudieron cargar los clientes',
          timeoutMs: 2500,
        }),
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
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
      d.getHours()
    )}:${pad(d.getMinutes())}`;
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

  /**
   * Lógica de cálculo:
   *  - busca la sala y su size
   *  - diferencia de horas (mínimo 1)
   *  - si el inicio es sábado o domingo +20%
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

    // CAMBIO: usamos SalaSize tal cual (PEQUEÑA, MEDIANA, GRANDE), nada de replace('Ñ','N')
    const size = sala.salaSize as SalaSize;
    const tarifaBase = this.tarifaPorHoraPorSize[size];

    if (!tarifaBase || tarifaBase <= 0) return 0;

    const diffMs = fin.getTime() - inicio.getTime();
    const horas = diffMs / (1000 * 60 * 60);
    const horasRedondeadas = Math.max(1, Math.ceil(horas)); // minimo 1h

    let monto = tarifaBase * horasRedondeadas;

    // 0 = domingo, 6 = sábado
    const dia = inicio.getDay();
    const esFinDeSemana = dia === 0 || dia === 6;
    if (esFinDeSemana) {
      monto = monto * 1.2; // +20%
    }

    return Math.round(monto); // redondeamos al entero mas cercano
  }
}
