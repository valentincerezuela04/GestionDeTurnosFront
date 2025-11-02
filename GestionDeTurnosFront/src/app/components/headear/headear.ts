import { Component, output } from '@angular/core';

@Component({
  selector: 'app-headear',
  imports: [],
  standalone:true,
  templateUrl: './headear.html',
  styleUrl: './headear.css',
})
export class Headear {
  menuToongle = output<void>()
  onToongle(){this.menuToongle.emit()}
}
