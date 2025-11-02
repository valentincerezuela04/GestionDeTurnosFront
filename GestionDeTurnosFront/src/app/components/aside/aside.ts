import { Component, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-aside',
  imports: [RouterLink],
  templateUrl: './aside.html',
  styleUrl: './aside.css',
})
export class Aside {
  open = input.required<boolean>()
}
