import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Aside } from "./components/aside/aside";
import { Headear } from "./components/headear/headear";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Aside, Headear],
  standalone:true,
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('GestionDeTurnosFront');
}
