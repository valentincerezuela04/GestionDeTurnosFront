import { Component, inject } from '@angular/core';
import { SalasService } from '../../../services/salas-service';
import { toSignal } from '@angular/core/rxjs-interop';
import { CardHall } from "../card-hall/card-hall";

@Component({
  selector: 'app-hall',
  imports: [CardHall],
  templateUrl: './hall.html',
  styleUrl: './hall.css',
})
export class Hall {
  serv = inject(SalasService)


  hallList = toSignal(this.serv.getAll(),{initialValue: []})
  
}
