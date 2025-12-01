import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { catchError, combineLatest, of } from 'rxjs';

import { ReservaService } from '../../../services/Reservas/reservas-service';
import { AuthService } from '../../../services/Auth/auth-service';
import { ReservaResponseDTO } from '../../../dto/Reserva';
import { UserInfoResponseDTO } from '../../../dto/user-info-response-dto';
import { CardReserva } from '../card-reserva/card-reserva';

// ... imports iguales

@Component({
  selector: 'app-historial-cliente',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CardReserva],
  templateUrl: './historial-cliente.html',
  styleUrl: './historial-cliente.css',
})
export class HistorialCliente implements OnInit {
  private readonly reservaSrv = inject(ReservaService);
  private readonly authSrv = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  private clienteEmailActual: string | null = null;
  private usuarioRolActual: UserInfoResponseDTO['role'] | null = null;

  private historialOriginal: ReservaResponseDTO[] = [];
  historialFiltrado: ReservaResponseDTO[] = [];

  filtrosForm!: FormGroup;
  salasDisponibles: number[] = [];
  estadosDisponibles: string[] = ['TODOS', 'FINALIZADO', 'CANCELADO', 'ACTIVO'];

  loading = true;
  error: string | null = null;

  ngOnInit(): void {
    this.buildForm();
    this.cargarUsuarioYHistorial();
  }

  private buildForm(): void {
    this.filtrosForm = this.fb.group({
      fechaDesde: [''],
      fechaHasta: [''],
      estado: ['TODOS'],
      salaNumero: ['TODAS'],
      ordenFecha: ['DESC'],
    });

    this.filtrosForm.valueChanges.subscribe(() => {
      this.aplicarFiltros();
    });
  }

  private cargarUsuarioYHistorial(): void {
    this.authSrv.getUserInfo().subscribe({
      next: (user) => {
        const usuario = user as UserInfoResponseDTO;
        const idCliente = usuario.id ?? this.authSrv.user()?.id;
        this.usuarioRolActual = (usuario.role ?? this.authSrv.user()?.rol ?? null) as
          | UserInfoResponseDTO['role']
          | null;
        this.clienteEmailActual = usuario.email ?? this.authSrv.user()?.email ?? null;

        if (!idCliente) {
          this.error = 'No se pudo determinar el usuario actual.';
          this.loading = false;
          return;
        }

        this.cargarHistorial(idCliente);
      },
      error: (err) => {
        console.error('Error al obtener el usuario actual:', err);
        const fallback = this.authSrv.user();
        if (fallback?.id) {
          this.usuarioRolActual = this.usuarioRolActual ?? fallback.rol ?? null;
          this.clienteEmailActual = this.clienteEmailActual ?? fallback.email ?? null;
          this.cargarHistorial(fallback.id);
        } else {
          this.error = 'No se pudo determinar el usuario actual.';
          this.loading = false;
        }
      },
    });
  }

  private cargarHistorial(clienteId: number): void {
    const rol = (this.usuarioRolActual ?? '').toString().toUpperCase();
    const esCliente = rol === 'CLIENTE';
    const esAdmin = rol === 'ADMIN';

    if (esCliente) {
      combineLatest([
        this.reservaSrv.getHistorialCliente(clienteId),
        this.reservaSrv.getReservasActivas().pipe(
          catchError((err) => {
            console.error('Error al cargar reservas activas:', err);
            return of([] as ReservaResponseDTO[]);
          })
        ),
      ]).subscribe({
        next: ([reservas, activas]) => {
          const activasCliente = this.filtrarPorCliente(activas ?? []);
          this.historialOriginal = this.mezclarReservas(reservas ?? [], activasCliente);
          this.afterLoad();
        },
        error: (err) => {
          console.error('Error al cargar historial del cliente:', err);
          this.error = 'No se pudo cargar tu historial de reservas.';
          this.loading = false;
        },
      });
      return;
    }

    this.reservaSrv.getHistorialGeneral().subscribe({
      next: (reservas) => {
        this.historialOriginal = reservas ?? [];
        this.afterLoad();
      },
      error: (err) => {
        console.error('Error al cargar historial general:', err);
        if (esAdmin) {
          this.error = 'No se pudo cargar el historial de reservas.';
          this.loading = false;
          return;
        }
        this.reservaSrv.getReservasActivas().subscribe({
          next: (activas) => {
            this.historialOriginal = activas ?? [];
            this.afterLoad();
          },
          error: (err2) => {
            console.error('Error al cargar reservas activas como fallback:', err2);
            this.error = 'No se pudo cargar el historial de reservas.';
            this.loading = false;
          },
        });
      },
    });
  }

  private afterLoad(): void {
    this.loading = false;
    this.salasDisponibles = [...new Set(this.historialOriginal.map((r) => r.salaNumero))].sort(
      (a, b) => a - b
    );
    this.aplicarFiltros();
  }

  private aplicarFiltros(): void {
    if (!this.filtrosForm) {
      this.historialFiltrado = [...this.historialOriginal];
      return;
    }

    const { fechaDesde, fechaHasta, estado, salaNumero, ordenFecha } = this.filtrosForm.value;

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

    filtradas.sort((a, b) => {
      const da = new Date(a.fechaInicio).getTime();
      const db = new Date(b.fechaInicio).getTime();
      return ordenFecha === 'ASC' ? da - db : db - da;
    });

    this.historialFiltrado = filtradas;
  }

  resetFiltros(): void {
    this.filtrosForm.reset({
      fechaDesde: '',
      fechaHasta: '',
      estado: 'TODOS',
      salaNumero: 'TODAS',
      ordenFecha: 'DESC',
    });
  }

  onReservaClick(reserva: ReservaResponseDTO): void {
    this.router.navigate(['/reservas', reserva.id, 'details']);
  }

  private filtrarPorCliente(reservas: ReservaResponseDTO[]): ReservaResponseDTO[] {
    const email = (this.clienteEmailActual ?? '').toLowerCase();
    if (!email) {
      return [];
    }
    return reservas.filter((r) => (r.clienteEmail ?? '').toLowerCase() === email);
  }

  private mezclarReservas(a: ReservaResponseDTO[], b: ReservaResponseDTO[]): ReservaResponseDTO[] {
    const mapa = new Map<number, ReservaResponseDTO>();
    [...a, ...b].forEach((r) => mapa.set(r.id, r));
    return Array.from(mapa.values());
  }
}
