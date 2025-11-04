// // src/app/features/reservas/reservas-list/reservas-list.component.ts
// import { Component, inject, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { Reserva } from '../../../models/reservas/reserva';
// import { ReservasService } from '../../../services/Reservas/reservas-service';
// import { RouterLink } from '@angular/router';

// @Component({
//   selector: 'app-reservas-list',
//   templateUrl: 'reserva-list.html',
// })
// export class ReservasListComponent implements OnInit {
//   reservas: Reserva[] = [];
//   loading = false;
//   error = '';

//   reservaService = inject(ReservasService);

//   ngOnInit(): void {
//     this.cargarReservas();
//   }

//   cargarReservas(): void {
//     this.loading = true;
//     this.error = '';

//     this.reservaService.getReservasActivas().subscribe({
//       next: (data) => {
//         this.reservas = data;
//         this.loading = false;
//       },
//       error: () => {
//         this.error = 'Error cargando reservas';
//         this.loading = false;
//       }
//     });
//   }

//   cancelar(id: number): void {
//     if (!confirm('¿Cancelar la reserva?')) return;

//     this.reservaService.cancelarReservaCliente(id).subscribe({
//       next: () => this.cargarReservas()
//     });
//   }

//   eliminar(id: number): void {
//     if (!confirm('¿Eliminar definitivamente la reserva?')) return;

//     this.reservaService.deleteReserva(id).subscribe({
//       next: () => this.cargarReservas()
//     });
//   }
// }
