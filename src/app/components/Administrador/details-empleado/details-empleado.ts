import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EMPTY, Subject, switchMap, takeUntil } from 'rxjs';
import { EmpledosService } from '../../../services/Empleados/empledos-service';
import { EmpleadoResponseDTO } from '../../../dto/Empleado/empleado-response-dto';
import { Rol } from '../../../models/usuarios/rol';

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

  roles = Object.values(Rol);

  readonly empleadoForm = this.fb.nonNullable.group({
    nombre: ['', [Validators.required]],
    apellido: ['', [Validators.required]],
    dni: ['', [Validators.required]],
    telefono: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    contrasena: ['', [ Validators.minLength(4)]],
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
            dni: empleado.dni,
            telefono: empleado.telefono,
            email: empleado.email,
            contrasena: '',
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
      dni: this.empleado.dni,
      telefono: this.empleado.telefono,
      email: this.empleado.email,
      contrasena: '',
      legajo: this.empleado.legajo ?? '',
      rol: this.empleado.rol,
    });
    this.saveErrorMessage = null;
    this.editMode.set(false);
  }

  guardarCambios(): void {
    if (!this.empleado || this.empleadoForm.invalid) {
      this.empleadoForm.markAllAsTouched();
      return;
    }

      const raw = this.empleadoForm.getRawValue();
  const nuevaContrasena = (raw.contrasena ?? '').trim();

    const cambios = {
      ...this.empleado,
      ...raw,
      contrasena: nuevaContrasena,
      rol:Rol.EMPLEADO
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
