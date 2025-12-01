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

function optionalMinLength(min: number) {
  return (control: any) => {
    const value = (control?.value ?? '') as string;
    if (!value) {
      return null; // si está vacío, no marca error (campo opcional)
    }
    return value.length >= min
      ? null
      : { minlength: { requiredLength: min, actualLength: value.length } };
  };
}

function optionalPattern(regex: RegExp) {
  return (control: any) => {
    const value = (control?.value ?? '') as string;
    if (!value) {
      return null; // si está vacío, no marca error
    }
    return regex.test(value)
      ? null
      : { pattern: { requiredPattern: regex.toString(), actualValue: value } };
  };
}


@Component({
  selector: 'app-perfil-usuario',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CardUsuario],
  templateUrl: './perfil-usuario.html',
  styleUrl: './perfil-usuario.css',
})
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
    dni: ['', [Validators.required, Validators.maxLength(8), Validators.pattern(/^[0-9]{7,8}$/)]],
    telefono: ['', [Validators.required, Validators.maxLength(10), Validators.pattern(/^[0-9]{10}$/)]],
    email: ['', [Validators.required, Validators.email]],
    // Contraseña opcional, pero con mismas reglas que en registro cuando se usa
    contrasena: ['', [optionalMinLength(4), optionalPattern(/\d/)]],
    confirmarContrasena: ['', [optionalMinLength(4), optionalPattern(/\d/)]],
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
          console.error('Error al obtener la informacion del usuario autenticado:', error);
          this.errorMessage.set('No se pudo cargar la informacion del usuario.');
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
      contrasena: '',
      confirmarContrasena: '',
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

    const formValue = this.clienteForm.getRawValue();

    // --- Validación de nueva contraseña + confirmación ---
    const nuevaContrasena = (formValue.contrasena ?? '').trim();
    const confirmarContrasena = (formValue.confirmarContrasena ?? '').trim();

    // Limpiar error de 'mismatch' previo (si lo hubiera)
    const confirmarCtrl = this.clienteForm.get('confirmarContrasena');
    if (confirmarCtrl?.errors?.['mismatch']) {
      const { mismatch, ...rest } = confirmarCtrl.errors;
      confirmarCtrl.setErrors(Object.keys(rest).length ? rest : null);
    }

    // Si el usuario quiso cambiar la contraseña (al menos uno de los dos campos tiene valor)
    if (nuevaContrasena || confirmarContrasena) {
      // Ambos campos deben estar completos
      if (!nuevaContrasena || !confirmarContrasena) {
        this.formError.set('Debes completar ambos campos de contrasena.');
        this.clienteForm.get('contrasena')?.markAsTouched();
        this.clienteForm.get('confirmarContrasena')?.markAsTouched();
        return;
      }

      // Reglas de mínimo 4 caracteres + al menos un número
      if (
        this.clienteForm.get('contrasena')?.invalid ||
        this.clienteForm.get('confirmarContrasena')?.invalid
      ) {
        this.formError.set('La contrasena debe tener al menos 4 caracteres e incluir un numero.');
        this.clienteForm.get('contrasena')?.markAsTouched();
        this.clienteForm.get('confirmarContrasena')?.markAsTouched();
        return;
      }

      // Coincidencia entre ambas contraseñas
      if (nuevaContrasena !== confirmarContrasena) {
        this.formError.set('Las contrasenas no coinciden.');
        confirmarCtrl?.setErrors({ ...(confirmarCtrl.errors ?? {}), mismatch: true });
        confirmarCtrl?.markAsTouched();
        return;
      }
    }

    // Validaciones generales del formulario (nombre, apellido, dni, etc.)
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

    const dniStr = (formValue.dni ?? '').toString().trim();
    const telefonoStr = (formValue.telefono ?? '').toString().trim();

    if (!/^\d{7,8}$/.test(dniStr)) {
      this.formError.set('El DNI debe tener solo numeros y un maximo de 8 digitos.');
      return;
    }

    if (!/^\d{10}$/.test(telefonoStr)) {
      this.formError.set('El telefono debe tener exactamente 10 digitos sin espacios.');
      return;
    }

    const dni = Number(dniStr);
    const telefono = Number(telefonoStr);

    const payload: Cliente = {
      ...current,
      nombre: formValue.nombre,
      apellido: formValue.apellido,
      dni,
      telefono,
      email: formValue.email,
      // Si no se ingresó nueva contraseña, se mantiene la actual
      contrasena: nuevaContrasena || current.contrasena,
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
