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
import { UiAlertService } from '../../../services/Ui-alert/ui-alert';

function optionalMinLength(min: number) {
  return (control: any) => {
    const value = (control?.value ?? '') as string;
    if (!value) {
      return null;
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
      return null;
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
  private uiAlert = inject(UiAlertService);
  private readonly lettersOnly = /[^\p{L}\s]/gu;
  private readonly digitsOnly = /\D+/g;

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
    contrasena: ['', [optionalMinLength(4), optionalPattern(/\d/)]],
    confirmarContrasena: ['', [optionalMinLength(4), optionalPattern(/\d/)]],
  });

  readonly controls = this.clienteForm.controls;

  readonly rolActual = computed(() => this.normalizarRol(this.userInfo()?.role ?? null));
  readonly rolActualTexto = computed(() => this.rolActual() ?? 'USUARIO');

  readonly esCliente = computed(() => this.rolActual() === Rol.CLIENTE);
  readonly esEmpleado = computed(() => this.rolActual() === Rol.EMPLEADO);
  readonly esAdmin = computed(() => this.rolActual() === Rol.ADMIN);

  onLettersInput(event: Event, controlName: string): void {
    const input = event.target as HTMLInputElement | null;
    if (!input) return;
    const sanitized = input.value.replace(this.lettersOnly, '');
    if (sanitized !== input.value) {
      input.value = sanitized;
      this.clienteForm.get(controlName)?.setValue(sanitized);
    }
  }

  onNumbersInput(event: Event, controlName: string): void {
    const input = event.target as HTMLInputElement | null;
    if (!input) return;
    const sanitized = input.value.replace(this.digitsOnly, '');
    if (sanitized !== input.value) {
      input.value = sanitized;
      this.clienteForm.get(controlName)?.setValue(sanitized);
    }
  }

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
        error: (error: unknown) => {
          console.error('Error al obtener la informacion del usuario autenticado:', error as any);
          this.errorMessage.set('No se pudo cargar la informacion del usuario.');
          this.isLoading.set(false);
          this.uiAlert.show({
            variant: 'error',
            tone: 'soft',
            title: 'Error',
            message: 'No se pudo cargar la información del usuario.',
            timeoutMs: 5000,
          });
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
          error: (error: unknown) => {
            console.error('Error al obtener los datos del cliente:', error as any);
            this.errorMessage.set('No se pudieron cargar los datos del cliente.');
            this.isLoading.set(false);
            this.uiAlert.show({
              variant: 'error',
              tone: 'soft',
              title: 'Error',
              message: 'No se pudieron cargar los datos del cliente.',
              timeoutMs: 5000,
            });
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
          error: (error: unknown) => {
            console.error('Error al obtener los datos del empleado:', error as any);
            this.errorMessage.set('No se pudieron cargar los datos del empleado.');
            this.isLoading.set(false);
            this.uiAlert.show({
              variant: 'error',
              tone: 'soft',
              title: 'Error',
              message: 'No se pudieron cargar los datos del empleado.',
              timeoutMs: 5000,
            });
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

    const nuevaContrasena = (formValue.contrasena ?? '').trim();
    const confirmarContrasena = (formValue.confirmarContrasena ?? '').trim();

    const confirmarCtrl = this.clienteForm.get('confirmarContrasena');
    if (confirmarCtrl?.errors?.['mismatch']) {
      const { mismatch, ...rest } = confirmarCtrl.errors;
      confirmarCtrl.setErrors(Object.keys(rest).length ? rest : null);
    }

    if (nuevaContrasena || confirmarContrasena) {
      if (!nuevaContrasena || !confirmarContrasena) {
        this.formError.set('Debes completar ambos campos de contrasena.');
        this.clienteForm.get('contrasena')?.markAsTouched();
        this.clienteForm.get('confirmarContrasena')?.markAsTouched();
        this.uiAlert.show({
          variant: 'warning',
          tone: 'soft',
          title: 'Warning alert',
          message: 'Debes completar ambos campos de contraseña.',
          timeoutMs: 4500,
        });
        return;
      }

      if (
        this.clienteForm.get('contrasena')?.invalid ||
        this.clienteForm.get('confirmarContrasena')?.invalid
      ) {
        this.formError.set('La contrasena debe tener al menos 4 caracteres e incluir un numero.');
        this.clienteForm.get('contrasena')?.markAsTouched();
        this.clienteForm.get('confirmarContrasena')?.markAsTouched();
        this.uiAlert.show({
          variant: 'warning',
          tone: 'soft',
          title: 'Warning alert',
          message: 'La contraseña debe tener al menos 4 caracteres e incluir un número.',
          timeoutMs: 5000,
        });
        return;
      }

      if (nuevaContrasena !== confirmarContrasena) {
        this.formError.set('Las contrasenas no coinciden.');
        confirmarCtrl?.setErrors({ ...(confirmarCtrl.errors ?? {}), mismatch: true });
        confirmarCtrl?.markAsTouched();
        this.uiAlert.show({
          variant: 'error',
          tone: 'soft',
          title: 'Error',
          message: 'Las contraseñas no coinciden.',
          timeoutMs: 5000,
        });
        return;
      }
    }

    if (this.clienteForm.invalid) {
      this.clienteForm.markAllAsTouched();
      this.formError.set('Completa los campos obligatorios para continuar.');
      this.uiAlert.show({
        variant: 'warning',
        tone: 'soft',
        title: 'Warning alert',
        message: 'Revisá los campos obligatorios para continuar.',
        timeoutMs: 4500,
      });
      return;
    }

    const current = this.clienteDetalle();
    if (!current) {
      this.formError.set('No se encontraron los datos actuales del cliente.');
      this.uiAlert.show({
        variant: 'error',
        tone: 'soft',
        title: 'Error',
        message: 'No se encontraron los datos actuales del cliente.',
        timeoutMs: 5000,
      });
      return;
    }

    const dniStr = (formValue.dni ?? '').toString().trim();
    const telefonoStr = (formValue.telefono ?? '').toString().trim();

    if (!/^\d{7,8}$/.test(dniStr)) {
      this.formError.set('El DNI debe tener solo numeros y un maximo de 8 digitos.');
      this.uiAlert.show({
        variant: 'warning',
        tone: 'soft',
        title: 'Warning alert',
        message: 'El DNI debe tener solo números y un máximo de 8 dígitos.',
        timeoutMs: 5000,
      });
      return;
    }

    if (!/^\d{10}$/.test(telefonoStr)) {
      this.formError.set('El telefono debe tener exactamente 10 digitos sin espacios.');
      this.uiAlert.show({
        variant: 'warning',
        tone: 'soft',
        title: 'Warning alert',
        message: 'El teléfono debe tener exactamente 10 dígitos sin espacios.',
        timeoutMs: 5000,
      });
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
          this.uiAlert.show({
            variant: 'success',
            tone: 'soft',
            title: 'Success alert',
            message: 'Perfil actualizado correctamente.',
            timeoutMs: 3000,
          });
        },
        error: (error: unknown) => {
          console.error('Error al actualizar el perfil del cliente:', error as any);
          this.formError.set('No se pudo actualizar el perfil. Intenta nuevamente.');
          this.isSaving.set(false);
          this.uiAlert.show({
            variant: 'error',
            tone: 'soft',
            title: 'Error',
            message: 'No se pudo actualizar el perfil. Intenta nuevamente.',
            timeoutMs: 5000,
          });
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
