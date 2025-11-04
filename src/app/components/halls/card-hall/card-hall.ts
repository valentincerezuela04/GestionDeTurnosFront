import { Component, input, output } from '@angular/core';
import { SalaDTO } from '../../../models/sala';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-card-hall',
  standalone:true,
  imports: [RouterLink],
  templateUrl: './card-hall.html',
  styleUrl: './card-hall.css',
})
export class CardHall {
  hall = input.required<Sala>()

  delete = output<number>()

  onDeleteClick() {
    this.delete.emit(this.hall().id)
  }
}
