import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EMPTY, Subject, switchMap, takeUntil } from 'rxjs';
import { EmpledosService } from '../../../services/Empleados/empledos-service';
import { EmpleadoResponseDTO } from '../../../dto/Empleado/empleado-response-dto';
import { Rol } from '../../../models/usuarios/rol';


function optionalMinLength(min: number) {
  return (control: any) => {
    const value = (control?.value ?? '') as string;
    if (!value) {
      return null; // si está vacío, no valida (campo opcional)
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
  selector: 'app-details-empleado',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './details-empleado.html',
  styleUrl: './details-empleado.css',
})
// Muestra la ficha completa de un empleado permitiendo editar sus datos o eliminarlo según acciones del administrador.
export class DetailsEmpleado implements OnInit, OnDestroy {
  private empleadoService = inject(EmpledosService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private destroyed$ = new Subject<void>();

  empleado?: EmpleadoResponseDTO;
  isLoading = true;
  deleteInProgress = false;
  errorMessage: string | null = null;
  saveErrorMessage: string | null = null;
  saveInProgress = signal(false);
  editMode = signal(false);

   readonly empleadoForm = this.fb.nonNullable.group({
    nombre: ['', [Validators.required]],
    apellido: ['', [Validators.required]],
    dni: ['', [Validators.required, Validators.maxLength(8), Validators.pattern(/^[0-9]{7,8}$/)]],
    telefono: ['', [Validators.required, Validators.maxLength(10), Validators.pattern(/^[0-9]{10}$/)]],
    email: ['', [Validators.required, Validators.email]],
    // contraseña opcional, mismas reglas que en perfil
    contrasena: ['', [optionalMinLength(4), optionalPattern(/\d/)]],
    confirmarContrasena: ['', [optionalMinLength(4), optionalPattern(/\d/)]],
    legajo: [''],
    rol: [Rol.EMPLEADO as Rol, [Validators.required]],
  });



  readonly controls = this.empleadoForm.controls;

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        takeUntil(this.destroyed$),
        switchMap((params) => {
          const idParam = params.get('id');
          const id = Number(idParam);
          if (!Number.isFinite(id)) {
            this.errorMessage = 'Identificador de empleado invalido.';
            this.isLoading = false;
            return EMPTY;
          }
          this.isLoading = true;
          this.errorMessage = null;
          return this.empleadoService.getById(id);
        })
      )
      .subscribe({
        next: (empleado) => {
          this.empleado = empleado;
          this.empleadoForm.patchValue({
            nombre: empleado.nombre,
            apellido: empleado.apellido,
            dni: empleado.dni != null ? String(empleado.dni) : '',
            telefono: empleado.telefono != null ? String(empleado.telefono) : '',
            email: empleado.email,
            contrasena: '',
            confirmarContrasena: '',
            legajo: empleado.legajo ?? '',
            rol: empleado.rol,
          });
          this.isLoading = false;

        },
        error: (error) => {
          console.error('Error al obtener el empleado:', error);
          this.errorMessage = 'No se pudo cargar la informacion del empleado.';
          this.isLoading = false;
        },
      });
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  eliminarEmpleado(): void {
    if (!this.empleado || this.deleteInProgress) {
      return;
    }

    const confirmacion = confirm(`Deseas eliminar a ${this.empleado.nombre} ${this.empleado.apellido}?`);
    if (!confirmacion) {
      return;
    }

    this.deleteInProgress = true;
    this.empleadoService.deleteById(this.empleado.id).subscribe({
      next: () => {
        alert('Empleado eliminado correctamente.');
        this.router.navigate(['/empleados']);
      },
      error: (error) => {
        console.error('Error al eliminar el empleado:', error);
        this.errorMessage = 'Ocurrio un error al eliminar el empleado.';
        this.deleteInProgress = false;
      },
    });
  }

  habilitarEdicion(): void {
    if (!this.empleado) {
      return;
    }
    this.saveErrorMessage = null;
    this.editMode.set(true);
    this.empleadoForm.markAsPristine();
  }

    cancelarEdicion(): void {
    if (!this.empleado) {
      return;
    }
    this.empleadoForm.reset({
      nombre: this.empleado.nombre,
      apellido: this.empleado.apellido,
      dni: this.empleado.dni != null ? String(this.empleado.dni) : '',
      telefono: this.empleado.telefono != null ? String(this.empleado.telefono) : '',
      email: this.empleado.email,
      contrasena: '',
      confirmarContrasena: '',
      legajo: this.empleado.legajo ?? '',
      rol: this.empleado.rol,
    });
    this.saveErrorMessage = null;
    this.editMode.set(false);
  }


    guardarCambios(): void {
    if (!this.empleado) {
      return;
    }

    this.saveErrorMessage = null;

    const raw = this.empleadoForm.getRawValue();
    const nuevaContrasena = (raw.contrasena ?? '').trim();
    const confirmarContrasena = (raw.confirmarContrasena ?? '').trim();

    const confirmarCtrl = this.empleadoForm.get('confirmarContrasena');
    const contrasenaCtrl = this.empleadoForm.get('contrasena');

    // Limpiar error de mismatch previo
    if (confirmarCtrl?.errors?.['mismatch']) {
      const { mismatch, ...rest } = confirmarCtrl.errors;
      confirmarCtrl.setErrors(Object.keys(rest).length ? rest : null);
    }

    // Si quiere cambiar la contraseña (alguno de los campos tiene algo)
    if (nuevaContrasena || confirmarContrasena) {
      // Ambos campos obligatorios en este caso
      if (!nuevaContrasena || !confirmarContrasena) {
        this.saveErrorMessage = 'Debes completar ambos campos de contrasena.';
        contrasenaCtrl?.markAsTouched();
        confirmarCtrl?.markAsTouched();
        return;
      }

      // Validaciones de longitud y patron
      if (contrasenaCtrl?.invalid || confirmarCtrl?.invalid) {
        this.saveErrorMessage = 'La contrasena debe tener al menos 4 caracteres e incluir un numero.';
        contrasenaCtrl?.markAsTouched();
        confirmarCtrl?.markAsTouched();
        return;
      }

      // Coincidencia
      if (nuevaContrasena !== confirmarContrasena) {
        this.saveErrorMessage = 'Las contrasenas no coinciden.';
        confirmarCtrl?.setErrors({ ...(confirmarCtrl.errors ?? {}), mismatch: true });
        confirmarCtrl?.markAsTouched();
        return;
      }
    }

    // Validaciones generales del formulario
    if (this.empleadoForm.invalid) {
      this.empleadoForm.markAllAsTouched();
      return;
    }

    const cambios = {
      ...this.empleado,
      nombre: raw.nombre,
      apellido: raw.apellido,
      dni: raw.dni != null ? String(raw.dni) : this.empleado.dni,
      telefono: raw.telefono != null ? String(raw.telefono) : this.empleado.telefono,
      email: raw.email,
      // mismo comportamiento que tenias antes: si va vacio, el backend decide si la ignora
      contrasena: nuevaContrasena,
      legajo: raw.legajo ?? this.empleado.legajo,
      rol: Rol.EMPLEADO,
    };

    this.saveInProgress.set(true);
    this.saveErrorMessage = null;

    this.empleadoService
      .updateEmpleado(this.empleado.id, cambios)
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: (empleadoActualizado) => {
          this.empleado = empleadoActualizado;
          this.empleadoForm.patchValue({
            nombre: empleadoActualizado.nombre,
            apellido: empleadoActualizado.apellido,
            dni: empleadoActualizado.dni,
            telefono: empleadoActualizado.telefono,
            email: empleadoActualizado.email,
            contrasena: '',
            confirmarContrasena: '',
            legajo: empleadoActualizado.legajo ?? '',
            rol: empleadoActualizado.rol,
          });
          this.saveInProgress.set(false);
          this.editMode.set(false);
          alert('Empleado actualizado correctamente.');
        },
        error: (error) => {
          console.error('Error al actualizar el empleado:', error);
          this.saveErrorMessage = 'No se pudo actualizar el empleado. Intenta nuevamente.';
          this.saveInProgress.set(false);
        },
      });
  }


  volverAlListado(): void {
    this.router.navigate(['/empleados']);
  }
}
