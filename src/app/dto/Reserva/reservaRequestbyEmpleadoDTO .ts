import { TipoPago } from "../../models/reservas/tipo-pago";
/** Cuándo: POST /api/reserva/crear/by-empleado.
 *  Para qué: crear una reserva para un cliente específico (requiere clienteId explícito).
 *  Fechas: "YYYY-MM-DDTHH:mm:ss" (LocalDateTime sin 'Z'). */
export class ReservaRequestByEmpleadoDTO {
  constructor(
    public clienteId: number,
    public salaId: number,
    public fechaInicio: string,
    public fechaFinal: string,
    public tipoPago: TipoPago
  ) {}
}
