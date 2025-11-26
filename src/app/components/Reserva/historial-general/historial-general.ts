import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';

import { ReservaService } from '../../../services/Reservas/reservas-service';
import { ReservaResponseDTO } from '../../../dto/Reserva';
import { CardReserva } from '../card-reserva/card-reserva';

@Component({
  selector: 'app-historial-general',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CardReserva],
  templateUrl: './historial-general.html',
  styleUrl: './historial-general.css',
})
export class HistorialGeneral implements OnInit {
  private readonly reservaSrv = inject(ReservaService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  private historialOriginal: ReservaResponseDTO[] = [];
  historialFiltrado: ReservaResponseDTO[] = [];

  filtrosForm!: FormGroup;

  salasDisponibles: number[] = [];
  estadosDisponibles: string[] = ['TODOS', 'FINALIZADO', 'CANCELADO', 'ACTIVO'];
  tiposPagoDisponibles: string[] = [];

  loading = true;
  error: string | null = null;

  ngOnInit(): void {
    this.buildForm();
    this.cargarHistorial();
  }

  private buildForm(): void {
    this.filtrosForm = this.fb.group({
      fechaDesde: [''],
      fechaHasta: [''],
      estado: ['TODOS'],
      salaNumero: ['TODAS'],
      clienteEmail: [''],
      tipoPago: ['TODOS'],
      montoMin: [''],
      montoMax: [''],
      ordenCampo: ['FECHA'], // FECHA | MONTO
      ordenDireccion: ['DESC'], // DESC | ASC
    });

    this.filtrosForm.valueChanges.subscribe(() => {
      this.aplicarFiltros();
    });
  }

  private cargarHistorial(): void {
    this.reservaSrv.getHistorialGeneral().subscribe({
      next: (reservas) => {
        this.historialOriginal = reservas ?? [];
        this.loading = false;

        // Salas y tipos de pago disponibles
        this.salasDisponibles = [...new Set(
          this.historialOriginal.map((r) => r.salaNumero)
        )].sort((a, b) => a - b);

        this.tiposPagoDisponibles = [...new Set(
          this.historialOriginal
            .map((r) => r.tipoPago)
            .filter((t) => !!t)
        )];

        this.aplicarFiltros();
      },
      error: (err) => {
        console.error('Error al cargar historial general:', err);
        this.error = 'No se pudo cargar el historial general de reservas.';
        this.loading = false;
      },
    });
  }

  private aplicarFiltros(): void {
    if (!this.filtrosForm) {
      this.historialFiltrado = [...this.historialOriginal];
      return;
    }

    const {
      fechaDesde,
      fechaHasta,
      estado,
      salaNumero,
      clienteEmail,
      tipoPago,
      montoMin,
      montoMax,
      ordenCampo,
      ordenDireccion,
    } = this.filtrosForm.value;

    let filtradas = [...this.historialOriginal];

    // Fechas
    if (fechaDesde) {
      const desde = new Date(fechaDesde);
      filtradas = filtradas.filter((r) => new Date(r.fechaInicio) >= desde);
    }

    if (fechaHasta) {
      const hasta = new Date(fechaHasta);
      filtradas = filtradas.filter((r) => new Date(r.fechaInicio) <= hasta);
    }

    // Estado
    if (estado && estado !== 'TODOS') {
      filtradas = filtradas.filter((r) => r.estado === estado);
    }

    // Sala
    if (salaNumero && salaNumero !== 'TODAS') {
      const sala = Number(salaNumero);
      filtradas = filtradas.filter((r) => r.salaNumero === sala);
    }

    // Cliente (por email, contiene)
    if (clienteEmail && clienteEmail.trim().length > 0) {
      const term = clienteEmail.toLowerCase().trim();
      filtradas = filtradas.filter((r) =>
        r.clienteEmail?.toLowerCase().includes(term)
      );
    }

    // Tipo de pago
    if (tipoPago && tipoPago !== 'TODOS') {
      filtradas = filtradas.filter((r) => r.tipoPago === tipoPago);
    }

    // Rango de monto
    const min = montoMin ? Number(montoMin) : null;
    const max = montoMax ? Number(montoMax) : null;

    if (min !== null && !Number.isNaN(min)) {
      filtradas = filtradas.filter((r) => (r.monto ?? 0) >= min);
    }

    if (max !== null && !Number.isNaN(max)) {
      filtradas = filtradas.filter((r) => (r.monto ?? 0) <= max);
    }

    // Orden
    filtradas.sort((a, b) => {
      let comp = 0;

      if (ordenCampo === 'MONTO') {
        const ma = a.monto ?? 0;
        const mb = b.monto ?? 0;
        comp = ma - mb;
      } else {
        // FECHA por defecto
        const da = new Date(a.fechaInicio).getTime();
        const db = new Date(b.fechaInicio).getTime();
        comp = da - db;
      }

      return ordenDireccion === 'ASC' ? comp : -comp;
    });

    this.historialFiltrado = filtradas;
  }

  resetFiltros(): void {
    this.filtrosForm.reset({
      fechaDesde: '',
      fechaHasta: '',
      estado: 'TODOS',
      salaNumero: 'TODAS',
      clienteEmail: '',
      tipoPago: 'TODOS',
      montoMin: '',
      montoMax: '',
      ordenCampo: 'FECHA',
      ordenDireccion: 'DESC',
    });
  }

  onReservaClick(reserva: ReservaResponseDTO): void {
    this.router.navigate(['/reservas', reserva.id, 'details']);
  }
}
