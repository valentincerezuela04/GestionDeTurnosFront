// src/app/features/reservas/reserva-form/reserva-form.component.ts
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  ReservaService,
  CrearReservaClienteDTO,
  ActualizarReservaDTO
} from '../../../services/Reservas/reservas-service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-reserva-form',
  templateUrl: 'reserva-form.html'
})
export class ReservaFormComponent implements OnInit {
  form!: FormGroup;
  editMode = false;
  reservaId?: number;

    fb = inject(FormBuilder);
    reservaService = inject(ReservaService);
    route = inject(ActivatedRoute);
    router = inject(Router);

  ngOnInit(): void {
    this.reservaId = Number(this.route.snapshot.paramMap.get('id'));
    this.editMode = !!this.reservaId;

    this.form = this.fb.group({
      salaId: [null, Validators.required],
      clienteId: [null], // solo si la crea un empleado
      fechaInicio: [null, Validators.required],
      fechaFinal: [null, Validators.required],
      tipoPago: ['EFECTIVO', Validators.required],
      descripcion: ['']
    });

    // Si quisieras precargar datos en modo edición,
    // podrías traer la reserva por id (si agregás ese endpoint en el back)
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    if (this.editMode && this.reservaId) {
      const dto: ActualizarReservaDTO = {
        reservaId: this.reservaId,
        descripcion: this.form.value.descripcion,
        fechaInicio: this.form.value.fechaInicio,
        fechaFinal: this.form.value.fechaFinal,
        tipoPago: this.form.value.tipoPago
      };

      this.reservaService.updateReservaCliente(dto).subscribe({
        next: () => this.router.navigate(['/reservas'])
      });
    } else {
      const dto: CrearReservaClienteDTO = {
        salaId: this.form.value.salaId,
        fechaInicio: this.form.value.fechaInicio,
        fechaFinal: this.form.value.fechaFinal,
        tipoPago: this.form.value.tipoPago
      };

      this.reservaService.createReservaCliente(dto).subscribe({
        next: () => this.router.navigate(['/reservas'])
      });
    }
  }
}
