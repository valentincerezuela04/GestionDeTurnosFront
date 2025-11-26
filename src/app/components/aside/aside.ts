import { Component, computed, inject, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/Auth/auth-service';
import { AppRole } from '../../models/auth.model';

@Component({
  selector: 'app-aside',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './aside.html',
  styleUrl: './aside.css',
})
export class Aside {
  private readonly auth = inject(AuthService);

  // viene desde app.component: [open]="sideBarOpen()"
  open = input.required<boolean>();

  // rol normalizado del usuario logueado
  private readonly role = computed(() => this.auth.user()?.rol as AppRole | null);

  // ADMIN o EMPLEADO → ven menú completo (clientes, perfil, historial general, etc.)
  readonly showFullMenu = computed(() => {
    const current = this.role();
    return current === 'ADMIN' || current === 'EMPLEADO';
  });

  // solo ADMIN
  readonly isAdmin = computed(() => this.role() === 'ADMIN');

  // solo CLIENTE
  readonly isCliente = computed(() => this.role() === 'CLIENTE');
}
