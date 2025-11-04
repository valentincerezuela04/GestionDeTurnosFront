import { Component, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SalasService } from '../../../services/Salas/salas-service';
import { SalaDTO } from '../../../models/sala';

@Component({
  selector: 'app-edit-description',
  imports: [ReactiveFormsModule],
  templateUrl: './edit-description.html',
  styleUrl: './edit-description.css',
})
export class EditDescription {
 private fb = inject(NonNullableFormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private salasService = inject(SalasService);

  private currentSala!: SalaDTO;

  form = this.fb.group({
    descripcion: ['', [Validators.required, Validators.minLength(6)]],
  });

    private idParam = this.route.snapshot.paramMap.get('id');
    private salaId = Number(this.idParam);
   

  constructor() {
  
   

    // traigo la sala actual para mostrar la descripción
    this.salasService.getById(this.salaId).subscribe(sala => {
      
      this.form.patchValue({
        descripcion: sala.descripcion,
      });
    });
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }


    const nuevaDesc = this.form.value.descripcion!;

    

    this.salasService.updateDescription(this.salaId,nuevaDesc).subscribe({
      next: () => {
        alert('Descripción actualizada con éxito');
        this.router.navigateByUrl('/hall')},
      error: (err) => console.error(err),
    });
  }
}
