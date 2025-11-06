import { Routes } from '@angular/router';

import { authCanMatch } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  {
    path: 'login',
    loadComponent: () =>
      import('./components/login/login-page-component/login-page-component').then(
        (m) => m.LoginPageComponent
      ),
    data: { title: 'Iniciar sesion' },
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./components/login/register-page-component/register-page-component').then(
        (m) => m.RegisterPageComponent
      ),
    data: { title: 'Registrarse' },
  },

  // Salas
  {
    path: 'hall', canMatch: [authCanMatch],
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
    path: 'empleados', canMatch: [authCanMatch],
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
    path: 'reservas', canMatch: [authCanMatch],
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
    path: 'clientes', canMatch: [authCanMatch],
    loadComponent: () =>
      import('./components/Cliente/cliente-list/cliente-list').then(
        (m) => m.ClientesListComponent
      ),
    data: { title: 'Clientes' },
  },

  // Calendario
  {
    path: 'calendar', canMatch: [authCanMatch],
    loadComponent: () =>
      import('./components/calendar/calendar').then((m) => m.Calendar),
    data: { title: 'Calendario' },
  },

  // Perfil del usuario
  {
    path: 'perfil', canMatch: [authCanMatch],
    loadComponent: () =>
      import('./components/Usuario/perfil-usuario/perfil-usuario').then(
        (m) => m.PerfilUsuario
      ),
    data: { title: 'Perfil' },
  },

  // Fallback
  { path: '**', redirectTo: 'hall' },
];



