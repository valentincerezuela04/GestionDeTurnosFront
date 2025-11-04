export class EventoCalendarioDTO {
  constructor(
    public id: number,
    public start: string,       // LocalDateTime -> ISO string
    public end: string,         // LocalDateTime -> ISO string
    public title: string,
    public description: string,
  ) {}
}
/** Cuándo: al sincronizar/mostrar eventos en calendario. 
 *  Para qué: transportar datos (inicio/fin/título/desc) de un evento asociado a una reserva. */

