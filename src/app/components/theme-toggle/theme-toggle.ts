import { Component, computed, inject } from '@angular/core';
import { ThemeService } from '../../services/theme-service';

@Component({
  selector: 'app-theme-toggle',
  imports: [],
  templateUrl: './theme-toggle.html',
  styleUrl: './theme-toggle.css',
})
export class ThemeToggle {
  theme = inject(ThemeService)
  isDark = computed(() => this.theme.theme() === 'dark')

  onChange(checked:boolean){
    this.theme.setTheme(checked ? 'dark' :'light')
  }

}
