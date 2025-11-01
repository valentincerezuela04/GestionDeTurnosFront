import { Component, input } from '@angular/core';
import { SalaDTO } from '../../../models/models';

@Component({
  selector: 'app-card-hall',
  imports: [],
  templateUrl: './card-hall.html',
  styleUrl: './card-hall.css',
})
export class CardHall {
  hall = input.required<SalaDTO>()



}
