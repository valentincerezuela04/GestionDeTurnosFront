export class LoginRequestDTO {
  constructor(
    public id: number,
    public email: string,
    public password: string,
  ) {}
}
/** Cuándo: al enviar credenciales. 
 *  Para qué: cuerpo de la petición de login con email y contraseña. */
