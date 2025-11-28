import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
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
// Provee el formulario de alta de empleados con validaciones y envío a la API antes de redirigir al listado.
export class EmpleadoFormPost {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private empleadoService = inject(EmpledosService);
  private destroyRef = inject(DestroyRef);

  readonly isSubmitting = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly empleadoForm = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    apellido: ['', Validators.required],
    dni: ['', [Validators.required, Validators.maxLength(8), Validators.pattern(/^[0-9]{7,8}$/)]],
    telefono: ['', [Validators.required, Validators.maxLength(10), Validators.pattern(/^[0-9]{10}$/)]],
    email: ['', [Validators.required, Validators.email]],
    contrasena: ['', [Validators.required, Validators.minLength(4), Validators.pattern(/\d/)]],
    legajo: [''],
    rol: this.fb.nonNullable.control(Rol.EMPLEADO as Rol),
  });

  submit(): void {
    if (this.empleadoForm.invalid) {
      this.empleadoForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const raw = this.empleadoForm.getRawValue();
    const payload = {
      ...raw,
      dni: (raw.dni ?? '').toString().trim(),
      telefono: (raw.telefono ?? '').toString().trim(),
      rol: Rol.EMPLEADO as Rol,
    };

    this.empleadoService
      .createEmpleado(payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          alert('Empleado creado correctamente.');
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

}
