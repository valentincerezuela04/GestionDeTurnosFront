import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';

import { Router } from '@angular/router';
import { catchError, combineLatest, of } from 'rxjs';


import { ReservaService } from '../../../services/Reservas/reservas-service';
import { ReservaResponseDTO } from '../../../dto/Reserva';
import { CardReserva } from '../card-reserva/card-reserva';
import { AuthService } from '../../../services/Auth/auth-service';

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
  private readonly auth = inject(AuthService);

  private historialOriginal: ReservaResponseDTO[] = [];
  historialFiltrado: ReservaResponseDTO[] = [];

  filtrosForm!: FormGroup;

  salasDisponibles: number[] = [];
  estadosDisponibles: string[] = ['TODOS', 'FINALIZADO', 'CANCELADO', 'ACTIVO'];
  tiposPagoDisponibles: string[] = [];

  loading = true;
  error: string | null = null;
  limpiando = false;
  eliminandoIds = new Set<number>();

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
        // Si falla, devolvemos lista vacía para no romper el combineLatest
        return of<ReservaResponseDTO[]>([]);
      })
    ),
    this.reservaSrv.getReservasActivas().pipe(
      catchError((err) => {
        console.error('Error al obtener reservas activas', err);
        // Si falla, simplemente no sumamos las activas
        return of<ReservaResponseDTO[]>([]);
      })
    ),
  ]).subscribe({
    next: ([historial, activas]) => {
      const todas = this.mezclarReservas(historial ?? [], activas ?? []);
      this.historialOriginal = todas;
      this.groupReservas();
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


  // Agrupa reservas de uno o varios arreglos, evitando duplicados por id
// y las ordena de más nueva a más vieja.
private groupReservas(...grupos: ReservaResponseDTO[][]): ReservaResponseDTO[] {
  const map = new Map<number, ReservaResponseDTO>();

  grupos
    .filter((g) => !!g)               // ignora null/undefined
    .forEach((grupo) => {
      grupo.forEach((r) => {
        if (!r) return;
        if (r.id == null) return;

        // Si ya existe una reserva con ese id, dejamos la primera que llegó
        // (si querés podrías mejorar acá con prioridad según estado)
        if (!map.has(r.id)) {
          map.set(r.id, r);
        }
      });
    });

  // Devolvemos las reservas únicas ordenadas por fechaInicio DESC (más nuevas primero)
  return Array.from(map.values()).sort(
    (a, b) =>
      new Date(b.fechaInicio).getTime() - new Date(a.fechaInicio).getTime()
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

  get esAdmin(): boolean {
    return this.auth.hasRole('ADMIN');
  }

  onDeleteReserva(reserva: ReservaResponseDTO): void {
    if (!this.esAdmin) return;
    if (!confirm('Eliminar definitivamente esta reserva?')) return;

    this.eliminandoIds.add(reserva.id);
    this.reservaSrv.deleteReserva(reserva.id).subscribe({
      next: () => {
        this.historialOriginal = this.historialOriginal.filter(r => r.id !== reserva.id);
        this.aplicarFiltros();
      },
      error: (err) => {
        console.error('Error al eliminar la reserva:', err);
        this.error = 'No se pudo eliminar la reserva.';
        this.eliminandoIds.delete(reserva.id);
      },
      complete: () => {
        this.eliminandoIds.delete(reserva.id);
      }
    });
  }


  private mezclarReservas(
  historial: ReservaResponseDTO[],
  activas: ReservaResponseDTO[]
): ReservaResponseDTO[] {
  const mapa = new Map<number, ReservaResponseDTO>();

  [...historial, ...activas].forEach((r) => mapa.set(r.id, r));

  return Array.from(mapa.values());
}





  limpiarHistorial(): void {
  if (!this.esAdmin) return;
  if (!confirm('Esto borrara el historial completo de reservas. Continuar?')) return;

  this.limpiando = true;
  this.reservaSrv.clearHistorial().subscribe({
    next: () => {
      // Volvemos a cargar datos (ahora solo se verán activas)
      this.loading = true;
      this.error = null;
      this.cargarHistorial();
    },
    error: (err) => {
      console.error('Error al limpiar el historial:', err);
      this.error = 'No se pudo limpiar el historial.';
      this.limpiando = false;
    },
    complete: () => {
      this.limpiando = false;
    }
  });
}



}
