import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EmpledosService } from '../../../services/Empleados/empledos-service';
import { Rol } from '../../../models/usuarios/rol';

@Component({
  selector: 'app-empleado-form-post',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './empleado-form-post.html',
  styleUrl: './empleado-form-post.css',
})
export class EmpleadoFormPost {
  showPassword = false;

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private empleadoService = inject(EmpledosService);
  private destroyRef = inject(DestroyRef);

  readonly isSubmitting = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly empleadoForm = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    apellido: ['', [Validators.required, Validators.minLength(3)]],
    dni: [
      '',
      [
        Validators.required,
        Validators.minLength(7),
        Validators.maxLength(8),
        Validators.pattern(/^\d+$/),
      ],
    ],
    telefono: [
      '',
      [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(20),
        Validators.pattern(/^[0-9+\-\s()]+$/),
      ],
    ],
    email: ['', [Validators.required, Validators.email]],
    contrasena: [
      '',
      [
        Validators.required,
        Validators.minLength(6),
        Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d).+$/),
      ],
    ],
    confirmarContrasena: [
      '',
      [
        Validators.required,
        Validators.minLength(6),
        Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d).+$/),
      ],
    ],
    legajo: [''],
    rol: this.fb.nonNullable.control(Rol.EMPLEADO as Rol),
  });

  readonly inputBase =
    'input w-full transition ' +
    'focus:outline-none focus:border-[var(--accent-500)] ' +
    'focus:shadow-[0_0_0_3px_var(--accent-glow)] ' +
    'focus-visible:border-[var(--accent-500)] ' +
    'focus-visible:shadow-[0_0_0_3px_var(--accent-glow)]';

  readonly hoverOk = 'hover:bg-[var(--bg)] hover:border-[var(--accent-400)]';
  readonly hoverBad = 'hover:border-[color:rgba(255,77,109,0.95)]';

  submit(): void {
    const raw = this.empleadoForm.getRawValue();

    const contrasena = (raw.contrasena ?? '').toString().trim();
    const confirmarContrasena = (raw.confirmarContrasena ?? '').toString().trim();

    const confirmarCtrl = this.empleadoForm.get('confirmarContrasena');
    if (confirmarCtrl?.errors?.['mismatch']) {
      const { mismatch, ...rest } = confirmarCtrl.errors;
      confirmarCtrl.setErrors(Object.keys(rest).length ? rest : null);
    }

    if (contrasena !== confirmarContrasena) {
      this.errorMessage.set('Las contraseñas no coinciden.');
      this.empleadoForm.get('contrasena')?.markAsTouched();
      confirmarCtrl?.setErrors({ ...(confirmarCtrl.errors ?? {}), mismatch: true });
      confirmarCtrl?.markAsTouched();
      return;
    }

    if (this.empleadoForm.invalid) {
      this.empleadoForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const payload = {
      nombre: raw.nombre,
      apellido: raw.apellido,
      dni: (raw.dni ?? '').toString().trim(),
      telefono: (raw.telefono ?? '').toString().trim(),
      email: raw.email,
      contrasena,
      legajo: raw.legajo,
      rol: Rol.EMPLEADO as Rol,
    };

    this.empleadoService
      .createEmpleado(payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.router.navigate(['/empleados']);
        },
        error: (error) => {
          console.error('Error al crear empleado:', error);
          this.errorMessage.set('No se pudo crear el empleado. Verifica los datos e intenta nuevamente.');
          this.isSubmitting.set(false);
        },
      });
  }

  cancelar(): void {
    this.router.navigate(['/empleados']);
  }

  ctrl(name: string): AbstractControl | null {
    return this.empleadoForm.get(name);
  }

  isInvalid(name: string): boolean {
    const c = this.ctrl(name);
    return !!c && c.invalid && (c.touched || c.dirty);
  }

  isValid(name: string): boolean {
    const c = this.ctrl(name);
    return !!c && c.valid && (c.touched || c.dirty);
  }

  hasError(name: string, errorCode: string): boolean {
    return !!this.ctrl(name)?.hasError(errorCode);
  }
}
