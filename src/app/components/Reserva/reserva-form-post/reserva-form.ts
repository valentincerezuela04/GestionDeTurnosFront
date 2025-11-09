// src/app/features/reservas/reserva-form/reserva-form.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

import { ReservaService } from '../../../services/Reservas/reservas-service';
import { AuthService } from '../../../services/Auth/auth-service';
import { SalasService } from '../../../services/Salas/salas-service';
import { ClientesService } from '../../../services/Clientes/cliente-service';

import { ReservaRequestByClienteDTO, ReservaRequestByEmpleadoDTO } from '../../../dto/Reserva';
import { UserInfoResponseDTO } from '../../../dto/user-info-response-dto';
import { SalaDTO as Sala } from '../../../models/sala';
import { Cliente } from '../../../models/usuarios/cliente';

@Component({
  selector: 'app-reserva-form',
  templateUrl: 'reserva-form.html',
  styleUrls: ['reserva-form.css'],
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
  tipoPagos: Array<'EFECTIVO' | 'TARJETA'> = ['EFECTIVO', 'TARJETA'];

  // DI
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
        tipoPago: ['EFECTIVO', Validators.required],
        descripcion: [''], // opcional (UI only, no se envía si tu back no lo soporta)
      },
      { validators: [this.dateRangeValidator] }
    );

    // Cargar salas para el <select>
    this.salasService.getAll().subscribe({
      next: (salas) => (this.salas = salas ?? []),
      error: () => this.snackBar.open('No se pudieron cargar las salas', 'Cerrar', { duration: 2500 }),
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.value;

    // Asegurar numéricos (el select/inputs devuelven string)
    const salaId = Number(v.salaId);
    if (Number.isNaN(salaId)) {
      this.snackBar.open('Seleccioná una sala válida', 'Cerrar', { duration: 2500 });
      return;
    }

    const clienteId = v.clienteId != null ? Number(v.clienteId) : null;
    if (this.isEmpleado() && (clienteId == null || Number.isNaN(clienteId))) {
      this.snackBar.open('Ingresá un cliente válido', 'Cerrar', { duration: 2500 });
      return;
    }

    // Formatear fechas para el backend (yyyy-MM-dd'T'HH:mm)
    const payloadBase = {
      salaId,
      fechaInicio: this.formatDateForApi(v.fechaInicio),
      fechaFinal: this.formatDateForApi(v.fechaFinal),
      tipoPago: v.tipoPago,
    };

    const onOk = () => {
      this.snackBar.open('Reserva creada correctamente', 'Cerrar', {
        duration: 3000,
        panelClass: ['success-snackbar'],
      });
      setTimeout(() => this.router.navigate(['/reservas']), 800);
    };

    const onError = (err: any) => {
      // Mirá la consola/Network para ver el cuerpo crudo del 400
      console.error('API error body =>', err?.error);

      const raw = (err?.error?.message || err?.error || '').toString();
      const isSolape = err?.status === 409 || /solap|ocupad/i.test(raw);
      this.snackBar.open(
        isSolape ? 'La sala no está disponible en ese horario.' : (raw || 'No se pudo crear la reserva'),
        'Cerrar',
        { duration: 3500, panelClass: [isSolape ? 'warn-snackbar' : 'error-snackbar'] }
      );
    };

    if (this.usuario?.role === 'CLIENTE') {
      const dto: ReservaRequestByClienteDTO = payloadBase as ReservaRequestByClienteDTO;
      this.reservaService.createReservaCliente(dto).subscribe({ next: onOk, error: onError });
    } else if (this.usuario?.role === 'EMPLEADO') {
      const dto: ReservaRequestByEmpleadoDTO = { ...payloadBase, clienteId: clienteId! };
      this.reservaService.createReservaEmpleado(dto).subscribe({ next: onOk, error: onError });
    } else {
      this.snackBar.open('No se pudo determinar el rol del usuario', 'Cerrar', { duration: 2500 });
    }
  }

  obtenerUsuarioActual(): void {
    this.authService.getUserInfo().subscribe({
      next: (data) => {
        this.usuario = data as UserInfoResponseDTO;

        // Si es EMPLEADO, clienteId es requerido
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

  // ===== Helpers =====

  private dateRangeValidator = (group: FormGroup) => {
    const i = group.get('fechaInicio')?.value;
    const f = group.get('fechaFinal')?.value;
    if (!i || !f) return null;
    return new Date(f) > new Date(i) ? null : { dateRange: true };
  };

  // Devuelve "YYYY-MM-DDTHH:mm" (sin segundos), que suele ser lo que esperan controladores con LocalDateTime
  private formatDateForApi(value: any): string {
    if (!value) return value;
    if (typeof value === 'string') {
      // "2025-11-06T18:30" o "2025-11-06T18:30:00"
      return value.length >= 16 ? value.slice(0, 16) : value;
    }
    const d = new Date(value);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  private cargarClientes(): void {
    this.clientesService.getAll().subscribe({
      next: (clientes) => (this.clientes = clientes ?? []),
      error: () => this.snackBar.open('No se pudieron cargar los clientes', 'Cerrar', { duration: 2500 })
    });
  }
}
