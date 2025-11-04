import { StringToken } from "@angular/compiler";
import { Rol } from "./rol";
export interface Usuario {

    id: number,
    nombre: string,
    apellido: String,
    dni: number,
    telefono: number,
    email: string,
    contrasena: string,
    rol: Rol;




}
