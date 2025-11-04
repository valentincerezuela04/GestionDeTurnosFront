import { Routes } from '@angular/router';
import { Hall } from './components/halls/hall/hall';
import { Login } from './components/login/login';
import { Client } from './components/client/client';

export const routes: Routes = [
    { path: '', redirectTo: 'hall', pathMatch: 'full' },

  {
    path: 'hall',
    loadComponent: () =>
      import('./components/halls/hall/hall').then(m => m.Hall),
    data: { title: 'Salas' }
  },
  {
    path: 'employee',
    loadComponent: () =>
      import('./components/employee/employee').then(m => m.Employee),
    data: { title: 'Empleados' }
  },
  {
    path: 'booking',
    loadComponent: () =>
      import('./components/booking/booking').then(m => m.Booking),
    data: { title: 'Reservas' }
  },
  {
    path: 'client',
    loadComponent: () =>
      import('./components/client/client').then(m => m.Client),
    data: { title: 'Clientes' }
  },
  {
    path: 'calendar',
    loadComponent: () =>
      import('./components/calendar/calendar').then(m => m.Calendar),
    data: { title: 'Calendario' }
  },

  { path: '**', redirectTo: 'hall' },
];
