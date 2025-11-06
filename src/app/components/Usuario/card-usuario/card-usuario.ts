import { CommonModule } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';
import { Rol } from '../../../models/usuarios/rol';

export interface UsuarioCardData {
  nombre?: string | null;
  apellido?: string | null;
  dni?: string | number | null;
  telefono?: string | number | null;
  email?: string | null;
  contrasena?: string | null;
  rol?: Rol | string | null;
  role?: Rol | string | null;
  legajo?: string | null;
}

@Component({
  selector: 'app-card-usuario',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card-usuario.html',
  styleUrl: './card-usuario.css',
})
export class CardUsuario {
  readonly usuario = input<UsuarioCardData | null>(null);
  readonly rol = input<Rol | string | null>(null);
  readonly titulo = input('Detalle del usuario');
  readonly mostrarEditar = input(false);

  readonly editar = output<void>();

  protected readonly rolNormalizado = computed(() => {
    const valor = this.rol();
    if (!valor) {
      return 'USUARIO';
    }
    return typeof valor === 'string' ? valor.toUpperCase() : valor;
  });

  protected readonly data = computed(() => this.usuario() ?? null);

  protected readonly rolDescripcion = computed(() => {
    const info = this.data();
    return info?.rol ?? info?.role ?? this.rolNormalizado();
  });

  protected onEditar(): void {
    this.editar.emit();
  }
}
