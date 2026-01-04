import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { EmpledosService } from '../../../services/Empleados/empledos-service';
import { EmpleadoResponseDTO } from '../../../dto/Empleado/empleado-response-dto';
import { CardEmpleados } from '../card-empleados/card-empleados';

@Component({
  selector: 'app-mis-empleados',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './mis-empleados.html',
  styleUrl: './mis-empleados.css',
})
// Gestiona el listado de empleados, su carga desde la API y la navegación hacia creación o detalle de cada ficha.
export class MisEmpleados implements OnInit {
  private empService = inject(EmpledosService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  readonly empleados = signal<EmpleadoResponseDTO[]>([]);
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.ObtenerEmpleados();
  }

  ObtenerEmpleados(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.empService
      .getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (empleados) => {
          this.empleados.set(empleados);
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Error al obtener empleados:', error);
          this.errorMessage.set('No se pudieron cargar los empleados. Intenta nuevamente.');
          this.isLoading.set(false);
        },
      });
  }

  onEmpleadoSelected(empleado: EmpleadoResponseDTO): void {
    this.router.navigate(['/empleados', empleado.id, 'details']);
  }

  crearEmpleado(): void {
    this.router.navigate(['/empleados', 'new']);
  }
}
