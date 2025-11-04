export class JwtAuthenticationResponseDTO {
  constructor(
    public token: string,
    public rol: string,
  ) {}
}
/** Cuándo: al iniciar sesión. 
 *  Para qué: representar la respuesta con el token JWT y el rol del usuario autenticado. */
