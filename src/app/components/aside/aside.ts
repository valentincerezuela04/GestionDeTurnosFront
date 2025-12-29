import { Component, computed, inject, input, output, signal } from '@angular/core';
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

   // ✅ esto viene del padre: <app-aside [open]="sideBarOpen()">
  open = input<boolean>(true);

  // ✅ esto es interno del aside
  mini = signal<boolean>(false);
  toggleMini() {
    this.mini.update(v => !v);
  }

  // (opcional) si querés cerrar el sidebar al tocar un link en mobile
  requestClose = output<void>();


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
