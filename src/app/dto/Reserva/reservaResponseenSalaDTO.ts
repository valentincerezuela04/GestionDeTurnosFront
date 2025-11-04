 import { TipoPago } from "../../models/reservas/tipo-pago";
/** Cuándo: listados/consultas por sala concreta.
 *  Para qué: respuesta centrada en datos de la sala y rango de la reserva. */
export class ReservaResponseEnSalaDTO {
  constructor(
    public id: number,
    public salaNumero: number,
    public salaCapacidad: number,
    public fechaInicio: string,
    public fechaFinal: string,
    public tipoPago: TipoPago,
    public estado: string // back envía String
  ) {}
}
