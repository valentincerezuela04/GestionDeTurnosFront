export class UserInfoResponseDTO {
  constructor(
    public email: string,
    public role: string,
  ) {}
}
/** Cuándo: consultar el perfil del usuario autenticado. 
 * Para qué: exponer email y rol actuales. */
