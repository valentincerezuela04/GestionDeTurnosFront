import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'hall', pathMatch: 'full' },

  // Salas
  {
    path: 'hall',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./components/halls/hall/hall').then((m) => m.Hall),
        data: { title: 'Salas' },
      },
      {
        path: 'new',
        loadComponent: () =>
          import('./components/halls/load-form/load-form').then(
            (m) => m.LoadForm
          ),
        data: { title: 'Crear sala' },
      },
      {
        path: ':id/edit',
        loadComponent: () =>
          import('./components/halls/edit-description/edit-description').then(
            (m) => m.EditDescription
          ),
        data: { title: 'Editar sala' },
      },
    ],
  },

  // Empleados
  {
    path: 'empleados',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./components/Administrador/mis-empleados/mis-empleados').then(
            (m) => m.MisEmpleados
          ),
        data: { title: 'Empleados' },
      },
      {
        path: 'new',
        loadComponent: () =>
          import('./components/Administrador/empleado-form-post/empleado-form-post').then(
            (m) => m.EmpleadoFormPost
          ),
        data: { title: 'Nuevo empleado' },
      },
      {
        path: ':id/details',
        loadComponent: () =>
          import('./components/Administrador/details-empleado/details-empleado').then(
            (m) => m.DetailsEmpleado
          ),
        data: { title: 'Detalle empleado' },
      },
    ],
  },
  {
    path: 'Empleados',
    redirectTo: 'empleados',
    pathMatch: 'full',
  },

  // Reservas
  {
    path: 'reservas',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./components/Reserva/mis-reservas/mis-reservas').then(
            (m) => m.MisReservas
          ),
        data: { title: 'Mis reservas' },
      },
      {
        path: ':id/details',
        loadComponent: () =>
          import('./components/Reserva/details-reserva/details-reserva').then(
            (m) => m.DetailsReserva
          ),
        data: { title: 'Detalle reserva' },
      },
    ],
  },
  

  // Clientes
  {
    path: 'clientes',
    loadComponent: () =>
      import('./components/Cliente/cliente-list/cliente-list').then(
        (m) => m.ClientesListComponent
      ),
    data: { title: 'Clientes' },
  },

  // Calendario
  {
    path: 'calendar',
    loadComponent: () =>
      import('./components/calendar/calendar').then((m) => m.Calendar),
    data: { title: 'Calendario' },
  },

  // Perfil del usuario
  {
    path: 'perfil',
    loadComponent: () =>
      import('./components/perfil-usuario/perfil-usuario').then(
        (m) => m.PerfilUsuario
      ),
    data: { title: 'Perfil' },
  },

  // Fallback
  { path: '**', redirectTo: 'hall' },
];
