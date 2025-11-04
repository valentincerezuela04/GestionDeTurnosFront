import { jsDocComment } from '@angular/compiler';
import { Component, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SalasService } from '../../../services/Salas/salas-service';
import { Router } from '@angular/router';
import { SalaDTO } from '../../../models/sala';

@Component({
  selector: 'app-load-form',
  imports: [ReactiveFormsModule],
  templateUrl: './load-form.html',
  styleUrl: './load-form.css',
})
export class LoadForm {
  fb = inject(NonNullableFormBuilder)
  serv = inject(SalasService)
  route = inject(Router)


  form = this.fb.group({
    nombre: ['',[Validators.required,Validators.minLength(3)]],
    numero: [0,[Validators.required,Validators.min(1)]],
    descripcion: ['',[Validators.required,Validators.minLength(6)]],
    cantidad_personas: [0,[Validators.required,Validators.min(1)]],
  });

  submit() {
    if(this.form.invalid) return;

    const newSala = this.form.getRawValue()
    this.serv.create(newSala).subscribe({
      next: () => {
        alert('Sala creada con éxito');
        this.route.navigateByUrl('/hall');
      },
      error: (e) => {
        alert('Error al crear la sala');
        console.error(e);
      }
    });
  }
}
