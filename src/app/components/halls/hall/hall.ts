import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CardHall } from "../card-hall/card-hall";
import { SalasService } from '../../../services/Salas/salas-service';


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
