import { effect, Injectable, signal } from '@angular/core';



export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
private key = 'gdt-theme';

  readonly theme = signal<Theme>(this.loadInitialTheme());

  constructor() {
    effect(() => {
      const t = this.theme();
      document.documentElement.dataset['theme']= t;
      localStorage.setItem(this.key, t);
    });
  }

  toggle() {
    this.theme.update(t => (t === 'dark' ? 'light' : 'dark'));
  }

  setTheme(t: Theme) {
    this.theme.set(t);
  }

  private loadInitialTheme(): Theme {
    const saved = localStorage.getItem(this.key);
    if (saved === 'light' || saved === 'dark') return saved;

    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
    return prefersDark ? 'dark' : 'light';
  }
}
