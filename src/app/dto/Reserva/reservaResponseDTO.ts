import { TipoPago } from "../../models/reservas/tipo-pago";
/** Cuándo: respuestas generales de reservas (ej.: GET /all/activas).
 *  Para qué: representar la reserva con datos de sala, rango, pago, estado y email del cliente.
 *  Nota: `estado` viene como String desde el back (podés mapearlo a tu enum si querés). */
export class ReservaResponseDTO {
  constructor(
    public id: number,
    public salaNumero: number,
    public salaCapacidad: number,
    public fechaInicio: string,  // LocalDateTime -> ISO local
    public fechaFinal: string,   // LocalDateTime -> ISO local
    public tipoPago: TipoPago,
    public estado: string,       // back envía String (no enum)
    public clienteEmail: string,
    public monto: number
  ) {}
}
