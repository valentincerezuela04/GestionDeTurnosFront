import { TipoPago } from "../../models/reservas/tipo-pago";
/** Cuándo: PUT /api/reserva/update (+ /update/by-empleado).
 *  Para qué: actualizar una reserva existente (incluye id a modificar).
 *  Fechas: "YYYY-MM-DDTHH:mm:ss" (LocalDateTime sin 'Z'). */
export class ReservaUpdateRequestDTO {
  constructor(
    public id: number,
    public salaId: number,
    public fechaInicio: string,
    public fechaFinal: string,
    public tipoPago: TipoPago
  ) {}
}
