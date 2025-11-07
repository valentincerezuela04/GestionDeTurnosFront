import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../../../services/Auth/auth-service';
import { EmpledosService } from '../../../services/Empleados/empledos-service';
import { ClientesService } from '../../../services/Clientes/cliente-service';
import { UserInfoResponseDTO } from '../../../dto/user-info-response-dto';
import { AuthUser } from '../../../models/auth.model';
import { CardUsuario } from '../card-usuario/card-usuario';
import { EmpleadoResponseDTO } from '../../../dto/Empleado/empleado-response-dto';
import { Cliente } from '../../../models/usuarios/cliente';
import { Rol } from '../../../models/usuarios/rol';

@Component({
  selector: 'app-perfil-usuario',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CardUsuario],
  templateUrl: './perfil-usuario.html',
  styleUrl: './perfil-usuario.css',
})
// Gestiona la visualizacion integral del perfil del usuario autenticado y habilita la edicion solo cuando el rol es CLIENTE.
export class PerfilUsuario implements OnInit {
  private authService = inject(AuthService);
  private empleadosService = inject(EmpledosService);
  private clientesService = inject(ClientesService);
  private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);

  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly userInfo = signal<UserInfoResponseDTO | null>(null);
  readonly empleadoDetalle = signal<EmpleadoResponseDTO | null>(null);
  readonly clienteDetalle = signal<Cliente | null>(null);
  readonly editMode = signal(false);
  readonly isSaving = signal(false);
  readonly formError = signal<string | null>(null);

  readonly clienteForm = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    apellido: ['', Validators.required],
    dni: ['', Validators.required],
    telefono: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    contrasena: ['', [Validators.required, Validators.minLength(4)]],
  });

  readonly controls = this.clienteForm.controls;

  readonly rolActual = computed(() => this.normalizarRol(this.userInfo()?.role ?? null));
  readonly rolActualTexto = computed(() => this.rolActual() ?? 'USUARIO');

  readonly esCliente = computed(() => this.rolActual() === Rol.CLIENTE);
  readonly esEmpleado = computed(() => this.rolActual() === Rol.EMPLEADO);
  readonly esAdmin = computed(() => this.rolActual() === Rol.ADMIN);

  ngOnInit(): void {
    this.cargarPerfil();
  }

  private cargarPerfil(): void {
    this.errorMessage.set(null);
    const cached = this.authService.user() as AuthUser | null;
    if (cached) {
      const info: UserInfoResponseDTO = { id: cached.id, nombre: cached.nombre, email: '', role: cached.rol };
      this.userInfo.set(info);
      this.cargarDetalle(info);
      return;
    }
    this.isLoading.set(true);
    this.authService
      .getUserInfo()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (user) => {
          const info = user as UserInfoResponseDTO;
          this.userInfo.set(info);
          this.isLoading.set(false);
          this.cargarDetalle(info);
        },
        error: (error) => {
          console.error('Error al obtener la información del usuario autenticado:', error);
          this.errorMessage.set('No se pudo cargar la información del usuario.');
          this.isLoading.set(false);
        },
      });
  }

  private cargarDetalle(user: UserInfoResponseDTO): void {
    const role = this.normalizarRol(user.role);
    const id = user.id;

    if (!role || !id) {
      this.isLoading.set(false);
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    if (role === Rol.CLIENTE) {
      this.clientesService
        .getById(id)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (cliente) => {
            this.clienteDetalle.set(cliente);
            this.patchClienteForm(cliente);
            this.isLoading.set(false);
          },
          error: (error) => {
            console.error('Error al obtener los datos del cliente:', error);
            this.errorMessage.set('No se pudieron cargar los datos del cliente.');
            this.isLoading.set(false);
          },
        });
    } else {
      this.empleadosService
        .getById(id)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (empleado) => {
            this.empleadoDetalle.set(empleado);
            this.isLoading.set(false);
          },
          error: (error) => {
            console.error('Error al obtener los datos del empleado:', error);
            this.errorMessage.set('No se pudieron cargar los datos del empleado.');
            this.isLoading.set(false);
          },
        });
    }
  }

  private patchClienteForm(cliente: Cliente): void {
    this.clienteForm.patchValue({
      nombre: cliente.nombre ?? '',
      apellido: cliente.apellido?.toString() ?? '',
      dni: cliente.dni !== undefined && cliente.dni !== null ? String(cliente.dni) : '',
      telefono: cliente.telefono !== undefined && cliente.telefono !== null ? String(cliente.telefono) : '',
      email: cliente.email ?? '',
      contrasena: cliente.contrasena ?? '',
    });
    this.clienteForm.markAsPristine();
    this.formError.set(null);
  }

  habilitarEdicion(): void {
    this.editMode.set(true);
    this.formError.set(null);
  }

  cancelarEdicion(): void {
    const cliente = this.clienteDetalle();
    if (cliente) {
      this.patchClienteForm(cliente);
    }
    this.editMode.set(false);
    this.isSaving.set(false);
    this.formError.set(null);
  }

  guardarCambios(): void {
    if (!this.esCliente() || !this.clienteDetalle()) {
      return;
    }

    if (this.clienteForm.invalid) {
      this.clienteForm.markAllAsTouched();
      this.formError.set('Completa los campos obligatorios para continuar.');
      return;
    }

    const current = this.clienteDetalle();
    if (!current) {
      this.formError.set('No se encontraron los datos actuales del cliente.');
      return;
    }

    const formValue = this.clienteForm.getRawValue();
    const dni = Number(formValue.dni);
    const telefono = Number(formValue.telefono);

    if (!Number.isFinite(dni) || !Number.isFinite(telefono)) {
      this.formError.set('DNI y teléfono deben ser valores numéricos.');
      return;
    }

    const payload: Cliente = {
      ...current,
      nombre: formValue.nombre,
      apellido: formValue.apellido,
      dni,
      telefono,
      email: formValue.email,
      contrasena: formValue.contrasena,
      rol: current.rol ?? Rol.CLIENTE,
    };

    this.isSaving.set(true);
    this.formError.set(null);

    this.clientesService
      .update(payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (clienteActualizado) => {
          this.clienteDetalle.set(clienteActualizado);
          this.patchClienteForm(clienteActualizado);
          this.isSaving.set(false);
          this.editMode.set(false);
          alert('Perfil actualizado correctamente.');
        },
        error: (error) => {
          console.error('Error al actualizar el perfil del cliente:', error);
          this.formError.set('No se pudo actualizar el perfil. Intenta nuevamente.');
          this.isSaving.set(false);
        },
      });
  }

  private normalizarRol(role: UserInfoResponseDTO['role'] | null): Rol | null {
    if (!role) {
      return null;
    }
    if (typeof role === 'string') {
      const normalized = role.toUpperCase() as keyof typeof Rol;
      return (Rol as Record<string, Rol>)[normalized] ?? null;
    }
    return role;
  }
}




