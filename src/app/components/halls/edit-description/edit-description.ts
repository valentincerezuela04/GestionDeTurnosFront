import { Component, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SalasService } from '../../../services/Salas/salas-service';
import { SalaDTO } from '../../../models/sala';
import { UiAlertService } from '../../../services/Ui-alert/ui-alert';

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
  private uiAlert = inject(UiAlertService)

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

    

    this.salasService.updateDescription(this.salaId, nuevaDesc).subscribe({
      next: () => {
        this.uiAlert.show({
          variant: 'success',
          tone: 'soft',
          title: 'Success alert',
          message: 'Descripción actualizada con éxito.',
          timeoutMs: 3000,
        });
        this.router.navigateByUrl('/hall');
      },
      error: (err: unknown) => {
        console.error(err as any);
        this.uiAlert.show({
          variant: 'error',
          tone: 'soft',
          title: 'Error',
          message: 'No se pudo actualizar la descripción. Intentá nuevamente.',
          timeoutMs: 5000,
        });
      },
    });
  }


  submitted = false;

private interacted(name: string): boolean {
  const c = this.form.get(name);
  return !!c && (this.submitted || c.touched || c.dirty);
}

isInvalid(name: string): boolean {
  const c = this.form.get(name);
  return !!c && this.interacted(name) && c.invalid;
}

isValid(name: string): boolean {
  const c = this.form.get(name);
  return !!c && this.interacted(name) && c.valid;
}

hasError(name: string, key: string): boolean {
  const c = this.form.get(name);
  return !!c && this.interacted(name) && !!c.errors?.[key];
}
}
