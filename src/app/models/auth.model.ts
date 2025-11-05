export interface AuthUser {
  id: number;
  nombre: string;
  rol: string;
  token: string;
}

export interface LoginRequest {
  email: string;
  contrasena: string;
}

export interface RegisterRequest {
  nombre: string;
  apellido: string;
  dni: string;
  telefono: string;
  email: string;
  contrasena: string;
}