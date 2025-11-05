import { Rol } from '../../models/usuarios/rol';
export interface EmpleadoResponseDTO {
  // Modelo para obtener empleados
  id: number;
  nombre: string;
  apellido: string;
  dni: string;
  telefono: string;
  email: string;
  contrasena: string;
  rol: Rol;
  legajo: string;
}
