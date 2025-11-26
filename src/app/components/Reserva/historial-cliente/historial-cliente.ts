import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';

import { ReservaService } from '../../../services/Reservas/reservas-service';
import { AuthService } from '../../../services/Auth/auth-service';
import { ReservaResponseDTO } from '../../../dto/Reserva';
import { UserInfoResponseDTO } from '../../../dto/user-info-response-dto';
import { CardReserva } from '../card-reserva/card-reserva';

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

  // Datos originales y filtrados
  private historialOriginal: ReservaResponseDTO[] = [];
  historialFiltrado: ReservaResponseDTO[] = [];

  // Filtros y opciones
  filtrosForm!: FormGroup;
  salasDisponibles: number[] = [];
  estadosDisponibles: string[] = ['TODOS', 'FINALIZADO', 'CANCELADO', 'ACTIVO'];

  loading = true;
  error: string | null = null;

  ngOnInit(): void {
    this.buildForm();
    this.cargarUsuarioYHistorial();
  }

  // Construye el formulario de filtros
  private buildForm(): void {
    this.filtrosForm = this.fb.group({
      fechaDesde: [''],
      fechaHasta: [''],
      estado: ['TODOS'],
      salaNumero: ['TODAS'],
      ordenFecha: ['DESC'], // DESC = más nuevas primero
    });

    // Cada vez que cambian los filtros, se recalcula la lista
    this.filtrosForm.valueChanges.subscribe(() => {
      this.aplicarFiltros();
    });
  }

  // Obtiene el usuario actual y luego carga su historial
  private cargarUsuarioYHistorial(): void {
    this.authSrv.getUserInfo().subscribe({
      next: (user) => {
        const usuario = user as UserInfoResponseDTO;
        const idCliente = usuario.id ?? this.authSrv.user()?.id;

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
          this.cargarHistorial(fallback.id);
        } else {
          this.error = 'No se pudo determinar el usuario actual.';
          this.loading = false;
        }
      },
    });
  }

  // Llama al backend para traer el historial del cliente
  private cargarHistorial(clienteId: number): void {
    this.reservaSrv.getHistorialCliente(clienteId).subscribe({
      next: (reservas) => {
        this.historialOriginal = reservas ?? [];
        this.loading = false;

        // Cargar salas disponibles para el select
        this.salasDisponibles = [...new Set(
          this.historialOriginal.map((r) => r.salaNumero)
        )].sort((a, b) => a - b);

        this.aplicarFiltros();
      },
      error: (err) => {
        console.error('Error al cargar historial del cliente:', err);
        this.error = 'No se pudo cargar tu historial de reservas.';
        this.loading = false;
      },
    });
  }

  // Lógica de filtrado en el front
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
      ordenFecha,
    } = this.filtrosForm.value;

    let filtradas = [...this.historialOriginal];

    // Filtro por fecha desde
    if (fechaDesde) {
      const desde = new Date(fechaDesde);
      filtradas = filtradas.filter((r) => {
        const inicio = new Date(r.fechaInicio);
        return inicio >= desde;
      });
    }

    // Filtro por fecha hasta
    if (fechaHasta) {
      const hasta = new Date(fechaHasta);
      filtradas = filtradas.filter((r) => {
        const inicio = new Date(r.fechaInicio);
        return inicio <= hasta;
      });
    }

    // Filtro por estado (si no es "TODOS")
    if (estado && estado !== 'TODOS') {
      filtradas = filtradas.filter((r) => r.estado === estado);
    }

    // Filtro por sala
    if (salaNumero && salaNumero !== 'TODAS') {
      const sala = Number(salaNumero);
      filtradas = filtradas.filter((r) => r.salaNumero === sala);
    }

    // Orden por fecha
    filtradas.sort((a, b) => {
      const da = new Date(a.fechaInicio).getTime();
      const db = new Date(b.fechaInicio).getTime();
      return ordenFecha === 'ASC' ? da - db : db - da;
    });

    this.historialFiltrado = filtradas;
  }

  // Botón para limpiar filtros
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
}
