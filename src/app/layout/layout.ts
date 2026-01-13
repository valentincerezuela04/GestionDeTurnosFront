import { Component, ElementRef, HostListener, QueryList, ViewChildren } from '@angular/core';
import { RouterOutlet } from "@angular/router";

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class Layout {
    @ViewChildren('wave') waves!: QueryList<ElementRef<SVGElement>>;

  @HostListener('window:scroll')
  onWindowScroll() {
    const y = window.scrollY;

    this.waves.forEach((waveRef, index) => {
      const speed = 0.15 + index * 0.15; // cada wave usa una velocidad
      waveRef.nativeElement.style.transform = `translateY(${y * speed}px)`;
    });
  }

}
