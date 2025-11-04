import { Routes } from '@angular/router';
import { Hall } from './components/halls/hall/hall';
import { Login } from './components/login/login';
import { Client } from './components/client/client';
import { LoadForm } from './components/halls/load-form/load-form';
export const routes: Routes = [
    { path: '', redirectTo: 'hall', pathMatch: 'full' },

  {
    path: 'hall',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./components/halls/hall/hall').then(m => m.Hall),
        data: { title: 'Salas' }
      },
      {
        path: 'new',
        loadComponent: () =>
          import('./components/halls/load-form/load-form').then(m => m.LoadForm),
        data: { title: 'Crear sala' }
      },        
      {path: ':id/edit',
        loadComponent: () =>
          import('./components/halls/edit-description/edit-description').then(m => m.EditDescription),
        data: { title: 'Editar sala' }
      }
      
    ]
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
