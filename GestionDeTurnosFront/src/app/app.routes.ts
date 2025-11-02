import { Routes } from '@angular/router';
import { Hall } from './components/halls/hall/hall';


const Lazy = (path: string) =>
  import(`./features/${path}/${path}.component`).then(m => m.DefaultComponent);

export const routes: Routes = [
      { path: '', redirectTo: 'salas', pathMatch: 'full' },
  { path: 'salas', loadComponent: () => Lazy('salas') },
  { path: 'empleados', loadComponent: () => Lazy('empleados') },
  { path: 'reservas', loadComponent: () => Lazy('reservas') },
  { path: 'clientes', loadComponent: () => Lazy('clientes') },
  { path: 'calendario', loadComponent: () => Lazy('calendario') },
  { path: '**', redirectTo: 'salas' },
];
