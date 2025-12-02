// src/app/components/Reserva/mis-reservas/mis-reservas.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { combineLatest, map, of } from 'rxjs';

import { ReservaService } from '../../../services/Reservas/reservas-service';
import { ReservaResponseDTO } from '../../../dto/Reserva';
import { AuthService } from '../../../services/Auth/auth-service';
import { UserInfoResponseDTO } from '../../../dto/user-info-response-dto';
import { CardReserva } from '../card-reserva/card-reserva';

@Component({
  selector: 'app-mis-reservas',
  standalone: true,
  imports: [CommonModule, CardReserva],
  templateUrl: './mis-reservas.html',
  styleUrls: ['./mis-reservas.css'],
})
export class MisReservas {
  private router = inject(Router);
  private reservaSrv = inject(ReservaService);
  private authService = inject(AuthService);

  reservas: ReservaResponseDTO[] = [];
  usuario: UserInfoResponseDTO | null = null;
  loading = true;
  mensajeClienteSinReservas = '';

  ngOnInit(): void {
    this.cargarDatos();
  }

  onReservaClick(reserva: ReservaResponseDTO): void {
    this.router.navigate(['/reservas', reserva.id, 'details']);
  }

  onNuevaReserva(): void {
    if (this.esAdmin()) {
      alert(
        'Los administradores pueden ver las reservas pero no crear nuevas. Usa una cuenta de cliente o empleado para generar una reserva.'
      );
      return;
    }
    this.router.navigate(['/reservas', 'new']);
  }

  mostrarBotonNuevaReserva(): boolean {
    return this.authService.isLoggedIn();
  }

  get tituloReservas(): string {
    return this.esCliente() ? 'Mis reservas' : 'Reservas';
  }

  private cargarDatos(): void {
    combineLatest<[ReservaResponseDTO[], UserInfoResponseDTO | null]>([
      this.reservaSrv.getReservasActivas().pipe(
        catchError((error) => {
          console.error('Error al obtener las reservas:', error);
          return of([] as ReservaResponseDTO[]);
        })
      ),
      this.authService.getUserInfo().pipe(
        map((user) => (user as UserInfoResponseDTO | null)),
        catchError((error) => {
          console.error('Error al obtener la informacion del usuario:', error);
          return of(null as UserInfoResponseDTO | null);
        })
      ),
    ]).subscribe(([reservas, usuario]) => {
      this.usuario = usuario;
      this.reservas = this.filtrarSegunUsuario(reservas, usuario);
      this.mensajeClienteSinReservas =
        this.esCliente() && this.reservas.length === 0
          ? 'Todavía no tienes reservas registradas.'
          : '';
      this.loading = false;
    });
  }

  private filtrarSegunUsuario(
    reservas: ReservaResponseDTO[],
    usuario: UserInfoResponseDTO | null
  ): ReservaResponseDTO[] {
    if (this.esCliente(usuario)) {
      const email = usuario?.email?.toLowerCase();
      if (!email) {
        return [];
      }
      return reservas.filter(
        (reserva) => (reserva.clienteEmail ?? '').toLowerCase() === email
      );
    }
    return reservas;
  }

  private esCliente(usuario: UserInfoResponseDTO | null = this.usuario): boolean {
    return this.normalizarRol(usuario?.role) === 'CLIENTE';
  }

  esAdmin(): boolean {
    const rol = this.authService.user()?.rol ?? this.usuario?.role;
    return this.normalizarRol(rol) === 'ADMIN';
  }

  private normalizarRol(rol: string | null | undefined): string | null {
    if (!rol) {
      return null;
    }
    return rol.toString().toUpperCase().replace(/^ROLE_/, '');
  }
}
