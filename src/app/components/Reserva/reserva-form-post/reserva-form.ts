// src/app/features/reservas/reserva-form/reserva-form.component.ts
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ReservaRequestByClienteDTO, ReservaRequestByEmpleadoDTO } from '../../../dto/Reserva';
import { ActivatedRoute, Router } from '@angular/router';
import { ReservaService } from '../../../services/Reservas/reservas-service';
import { AuthService } from '../../../services/Auth/auth-service';
import { UserInfoResponseDTO } from '../../../dto/UserInfoResponseDTO ';
import { CommonModule } from '@angular/common';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
	selector: 'app-reserva-form',
	templateUrl: 'reserva-form.html',
    imports: [
        ReactiveFormsModule,
        CommonModule,
        MatSnackBarModule
    ],
    standalone: true,
})
export class ReservaFormComponent implements OnInit {
	form!: FormGroup;
	editMode = false;
	reservaId?: number;
    usuario: UserInfoResponseDTO | null = null;

	fb = inject(FormBuilder);
	reservaService = inject(ReservaService);
    authService = inject(AuthService);
	route = inject(ActivatedRoute);
	router = inject(Router);
	snackBar = inject(MatSnackBar);	ngOnInit(): void {
        this.obtenerUsuarioActual();
		
		this.form = this.fb.group({
			salaId: [null, Validators.required],
			clienteId: [null], // solo si la crea un empleado
			fechaInicio: [null, Validators.required],
			fechaFinal: [null, Validators.required],
			tipoPago: ['EFECTIVO', Validators.required],
		});

	}


	onSubmit(): void {
        if (this.form.invalid) {
			console.error('Formulario inválido');
			return;
		}
        const formValue = this.form.value;

        if (this.usuario?.role === 'CLIENTE') {
            const reservaDTO: ReservaRequestByClienteDTO = {
                salaId: formValue.salaId,
                fechaInicio: formValue.fechaInicio,
                fechaFinal: formValue.fechaFinal,
                tipoPago: formValue.tipoPago,
            };
            this.reservaService.createReservaCliente(reservaDTO).subscribe({
                next: () => {
                    this.snackBar.open('Reserva creada correctamente', 'Cerrar', {
                        duration: 3000,
                        panelClass: ['success-snackbar']
                    });
                    setTimeout(() => {
                        this.router.navigate(['/mis-reservas']);
                    }, 1000);
                },
                error: (err) => {
                    console.error('Error creando reserva:', err);
                    this.snackBar.open('No se pudo crear la reserva', 'Cerrar', {
                        duration: 3000,
                        panelClass: ['error-snackbar']
                    });
                }
            });
        } else if (this.usuario?.role === 'EMPLEADO') {
            const reservaDTO: ReservaRequestByEmpleadoDTO = {
                salaId: formValue.salaId,
                clienteId: formValue.clienteId,
                fechaInicio: formValue.fechaInicio,
                fechaFinal: formValue.fechaFinal,
                tipoPago: formValue.tipoPago,
            };
            this.reservaService.createReservaEmpleado(reservaDTO).subscribe({
                next: () => {
                    this.snackBar.open('Reserva creada correctamente', 'Cerrar', {
                        duration: 3000,
                        panelClass: ['success-snackbar']
                    });
                    setTimeout(() => {
                        this.router.navigate(['/mis-reservas']);
                    }, 1000);
                },
                error: (err) => {
                    console.error('Error creando reserva:', err);
                    this.snackBar.open('No se pudo crear la reserva', 'Cerrar', {
                        duration: 3000,
                        panelClass: ['error-snackbar']
                    });
                }
            });
        }
	}


	obtenerUsuarioActual(): void {
		this.authService.getUserInfo().subscribe({
			next: (data) => {
				this.usuario = data as UserInfoResponseDTO;
			},
            error: (err) => {
                console.error('Error al obtener el usuario actual:', err);
            }
		});
	}

    // Método para verificar si el usuario es empleado
    isEmpleado(): boolean {
        return this.usuario?.role === 'EMPLEADO';
    }

}
