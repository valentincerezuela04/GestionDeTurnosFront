import { Rol } from './rol';

export interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  dni: number;
  telefono: number;
  email: string;
  contrasena: string;
  rol: Rol;
}
