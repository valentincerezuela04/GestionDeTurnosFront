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

  readonly roles = Object.values(Rol);
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
  legajo: [''],
});


  submit(): void {
    if (this.empleadoForm.invalid) {
      this.empleadoForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

      const formValue = this.empleadoForm.getRawValue();
    const payload ={
      ...formValue,
      rol:Rol.EMPLEADO as Rol
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
