import { Rol } from '../models/usuarios/rol';

export interface UserInfoResponseDTO {
  id?: number;
  nombre?: string;
  apellido?: string;
  dni?: number | string;
  telefono?: number | string;
  email: string;
  role: Rol | string;
  legajo?: string;
}
