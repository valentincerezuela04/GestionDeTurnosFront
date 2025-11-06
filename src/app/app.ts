import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { Aside } from './components/aside/aside';
import { Headear } from './components/headear/headear';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, Aside, Headear],
  standalone: true,
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private readonly authRoutes = ['/login', '/register'];

  protected readonly title = signal('GestionDeTurnosFront');

  readonly sideBarOpen = signal(true);
  readonly currentUrl = signal<string>(this.normalizeUrl(this.router.url));

  readonly showShell = computed(() => !this.authRoutes.includes(this.currentUrl()));
  toggleSidebar = () => this.sideBarOpen.set(!this.sideBarOpen());

  constructor() {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((event) => this.currentUrl.set(this.normalizeUrl(event.urlAfterRedirects)));
  }

  private normalizeUrl(url: string): string {
    return url.split('?')[0] || '/';
  }
}
