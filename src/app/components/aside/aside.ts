import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/Auth/auth-service';
import { AppRole } from '../../models/auth.model';

@Component({
  selector: 'app-aside',
  imports: [RouterLink],
  templateUrl: './aside.html',
  styleUrl: './aside.css',
})
export class Aside {
  private readonly auth = inject(AuthService);
  open = input.required<boolean>();

  private readonly role = computed(() => this.auth.user()?.rol as AppRole | null);
  readonly showFullMenu = computed(() => {
    const current = this.role();
    return current === 'ADMIN' || current === 'EMPLEADO';
  });
  readonly isAdmin = computed(() => this.role() === 'ADMIN');
}
