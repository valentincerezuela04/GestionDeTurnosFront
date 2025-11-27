import { TipoPago } from "../../models/reservas/tipo-pago";
/** Cuándo: POST /api/reserva/crear (cliente autenticado).
 *  Para qué: payload mínimo para crear una reserva SIN clienteId (lo toma del token).
 *  Fechas: "YYYY-MM-DDTHH:mm:ss" (LocalDateTime sin 'Z'). */
export class ReservaRequestByClienteDTO {
  constructor(
    public salaId: number,
    public fechaInicio: string,
    public fechaFinal: string,
    public tipoPago: TipoPago,
    public monto:number
  ) {}
}