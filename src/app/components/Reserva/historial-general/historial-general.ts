import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { catchError, combineLatest, of } from 'rxjs';

import { ReservaService } from '../../../services/Reservas/reservas-service';
import { ReservaResponseDTO } from '../../../dto/Reserva';
import { CardReserva } from '../card-reserva/card-reserva';
import { TipoPago } from '../../../models/reservas/tipo-pago';

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
  private readonly tiposPagoPermitidos: TipoPago[] = [TipoPago.EFECTIVO, TipoPago.MERCADO_PAGO];

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

  cargarHistorial(): void {
    this.loading = true;
    this.error = null;

    combineLatest([
      this.reservaSrv.getHistorialGeneral().pipe(
        catchError((err) => {
          console.error('Error al obtener historial general', err);
          return of<ReservaResponseDTO[]>([]);
        })
      ),
      this.reservaSrv.getReservasActivas().pipe(
        catchError((err) => {
          console.error('Error al obtener reservas activas', err);
          return of<ReservaResponseDTO[]>([]);
        })
      ),
    ]).subscribe({
      next: ([historial, activas]) => {
        // Mezclamos y ordenamos reservas activas + historial
        this.historialOriginal = this.groupReservas(historial ?? [], activas ?? []);

        // Llenamos combos auxiliares
        this.salasDisponibles = [...new Set(this.historialOriginal.map((r) => r.salaNumero))].sort(
          (a, b) => a - b
        );
        const presentes = [...new Set(this.historialOriginal.map((r) => r.tipoPago))]
          .filter((t): t is TipoPago => this.tiposPagoPermitidos.includes(t as TipoPago));
        const faltantes = this.tiposPagoPermitidos.filter((t) => !presentes.includes(t));
        this.tiposPagoDisponibles = [...presentes, ...faltantes];

        this.aplicarFiltros();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error inesperado al cargar historial', err);
        this.error = 'Error al cargar historial de reservas';
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

    if (fechaDesde) {
      const desde = new Date(fechaDesde);
      filtradas = filtradas.filter((r) => new Date(r.fechaInicio) >= desde);
    }

    if (fechaHasta) {
      const hasta = new Date(fechaHasta);
      filtradas = filtradas.filter((r) => new Date(r.fechaInicio) <= hasta);
    }

    if (estado && estado !== 'TODOS') {
      filtradas = filtradas.filter((r) => r.estado === estado);
    }

    if (salaNumero && salaNumero !== 'TODAS') {
      const sala = Number(salaNumero);
      filtradas = filtradas.filter((r) => r.salaNumero === sala);
    }

    if (clienteEmail && clienteEmail.trim().length > 0) {
      const term = clienteEmail.toLowerCase().trim();
      filtradas = filtradas.filter((r) =>
        r.clienteEmail?.toLowerCase().includes(term)
      );
    }

    if (this.esTipoPagoValido(tipoPago)) {
      filtradas = filtradas.filter((r) => r.tipoPago === tipoPago);
    }

    const min = montoMin ? Number(montoMin) : null;
    const max = montoMax ? Number(montoMax) : null;

    if (min !== null && !Number.isNaN(min)) {
      filtradas = filtradas.filter((r) => (r.monto ?? 0) >= min);
    }

    if (max !== null && !Number.isNaN(max)) {
      filtradas = filtradas.filter((r) => (r.monto ?? 0) <= max);
    }

    filtradas.sort((a, b) => {
      let comp = 0;

      if (ordenCampo === 'MONTO') {
        const ma = a.monto ?? 0;
        const mb = b.monto ?? 0;
        comp = ma - mb;
      } else {
        const da = new Date(a.fechaInicio).getTime();
        const db = new Date(b.fechaInicio).getTime();
        comp = da - db;
      }

      return ordenDireccion === 'ASC' ? comp : -comp;
    });

    this.historialFiltrado = filtradas;
  }

  // Metodo unico de mezcla y orden
  private groupReservas(...grupos: ReservaResponseDTO[][]): ReservaResponseDTO[] {
    const map = new Map<number, ReservaResponseDTO>();

    grupos
      .filter((g) => !!g)
      .forEach((grupo) => {
        grupo.forEach((r) => {
          if (!r || r.id == null) return;
          if (!map.has(r.id)) {
            map.set(r.id, r);
          }
        });
      });

    return Array.from(map.values()).sort(
      (a, b) => new Date(b.fechaInicio).getTime() - new Date(a.fechaInicio).getTime()
    );
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

  tipoPagoLabel(value: string): string {
    switch (value) {
      case TipoPago.EFECTIVO:
        return 'Efectivo';
      case TipoPago.MERCADO_PAGO:
        return 'Mercado Pago';
      default:
        return value;
    }
  }

  private esTipoPagoValido(value: unknown): value is TipoPago {
    return typeof value === 'string' && this.tiposPagoPermitidos.includes(value as TipoPago);
  }
}
