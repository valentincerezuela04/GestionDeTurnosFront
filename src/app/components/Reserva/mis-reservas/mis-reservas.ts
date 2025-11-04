// src/app/components/Reserva/mis-reservas/mis-reservas.ts
import { Component, inject, signal, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

import { ReservaService } from '../../../services/Reservas/reservas-service';
import { Reserva}  from '../../../models/reservas/reserva';

@Component({
  selector: 'app-mis-reservas',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './mis-reservas.html',
})
export class MisReservas {

  //Mostrar las reservas activas del usuario
  reservaSrv = inject(ReservaService);
  readonly error = signal<string | null>(null);

  

}
