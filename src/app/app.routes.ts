import { Routes } from '@angular/router';
import { LoginPageComponent } from './components/login/login-page-component/login-page-component';
import { RegisterPageComponent } from './components/login/register-page-component/register-page-component';
import { authCanMatch } from './guards/auth.guard';
import { roleGuard } from './guards/role-guard';
import { authGuard } from './guards/auth-guard';
export const routes: Routes = [

  //publico>>>>>>>
    {path:'login' ,component: LoginPageComponent} ,
    {path:'register' ,component: RegisterPageComponent} ,
    { path: '', redirectTo: 'hall', pathMatch: 'full' },

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
        canActivate: [roleGuard('ADMIN')],
      },
      {
        path: ':id/edit',
        loadComponent: () =>
          import('./components/halls/edit-description/edit-description').then(
            (m) => m.EditDescription
          ),
        data: { title: 'Editar sala' },
        canActivate: [roleGuard('ADMIN')],
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
        canActivate: [roleGuard('ADMIN')],
      },
      {
        path: 'new',
        loadComponent: () =>
          import('./components/Administrador/empleado-form-post/empleado-form-post').then(
            (m) => m.EmpleadoFormPost
          ),
        data: { title: 'Nuevo empleado' },
        canActivate: [roleGuard('ADMIN')],
      },
      {
        path: ':id/details',
        loadComponent: () =>
          import('./components/Administrador/details-empleado/details-empleado').then(
            (m) => m.DetailsEmpleado
          ),
        data: { title: 'Detalle empleado' },
        canActivate: [roleGuard('ADMIN')],
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
        canActivate: [roleGuard('CLIENTE', 'EMPLEADO')],
      },
      {
        path: 'new',
        loadComponent: () =>
          import('./components/Reserva/reserva-form-post/reserva-form').then(
            (m) => m.ReservaFormComponent
          ),
        data: { title: 'Nueva reserva' },
        canActivate: [roleGuard('CLIENTE', 'EMPLEADO')],
      },
      {
        path: ':id/details',
        loadComponent: () =>
          import('./components/Reserva/details-reserva/details-reserva').then(
            (m) => m.DetailsReserva
          ),
        data: { title: 'Detalle reserva' },
        canActivate: [roleGuard('CLIENTE', 'EMPLEADO')]
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
    canActivate: [roleGuard('CLIENTE', 'EMPLEADO')]
  },

  // Calendario
  {
    path: 'calendar', canMatch: [authCanMatch],
    loadComponent: () =>
      import('./components/Calendario/calendar-view/calendar-view').then((m) => m.CalendarViewComponent),
    data: { title: 'Calendario' },
    canActivate: [roleGuard('CLIENTE', 'EMPLEADO')]
  },

  // Perfil del usuario
  {
    path: 'perfil', canMatch: [authCanMatch],
    loadComponent: () =>
      import('./components/Usuario/perfil-usuario/perfil-usuario').then(
        (m) => m.PerfilUsuario
      ),
    data: { title: 'Perfil' },
    canActivate:[authGuard]
  },

  // Fallback
  { path: '**', redirectTo: 'hall' },
];



