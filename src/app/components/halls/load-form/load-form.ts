import { jsDocComment } from '@angular/compiler';
import { Component, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SalasService } from '../../../services/Salas/salas-service';
import { Router } from '@angular/router';
import { CreateSalaDTO, SalaSize } from '../../../models/sala';
import { UiAlertService } from '../../../services/Ui-alert/ui-alert';

@Component({
  selector: 'app-load-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './load-form.html',
  styleUrl: './load-form.css',
})
export class LoadForm {
  fb = inject(NonNullableFormBuilder);
  serv = inject(SalasService);
  route = inject(Router);
  private uiAlert = inject(UiAlertService);

  numeroOcupado = false;

  capacidadPorSize: Record<SalaSize, number> = {
    PEQUEÑA: 10,
    MEDIANA: 25,
    GRANDE: 40,
  };

  form = this.fb.group({
    numero: [0, [Validators.required, Validators.min(1)]],
    descripcion: ['', [Validators.required, Validators.minLength(6)]],
    salaSize: ['MEDIANA' as SalaSize | null, [Validators.required]],
    cantidad_personas: [0, [Validators.required]],
  });

  get capacidadSeleccionada(): number | null {
    const size = this.form.value.salaSize;
    return size ? this.capacidadPorSize[size] : null;
  }

  ngOnInit(): void {
    const sizeInicial = this.form.value.salaSize as SalaSize | null;
    if (sizeInicial) {
      this.form.patchValue(
        { cantidad_personas: this.capacidadPorSize[sizeInicial] },
        { emitEvent: false }
      );
    }

    this.form.get('salaSize')?.valueChanges.subscribe((size) => {
      if (!size) return;
      const capacidad = this.capacidadPorSize[size as SalaSize];
      this.form.patchValue({ cantidad_personas: capacidad }, { emitEvent: false });
    });
  }

  submit() {
    this.submitted = true;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.uiAlert.show({
        variant: 'warning',
        tone: 'soft',
        title: 'Warning alert',
        message: 'Revisá los campos: hay datos inválidos.',
        timeoutMs: 4500,
      });
      return;
    }

    const raw = this.form.getRawValue();

    const newSala: CreateSalaDTO = {
      numero: raw.numero!,
      descripcion: raw.descripcion!,
      salaSize: raw.salaSize as SalaSize,
      cantidad_personas: raw.cantidad_personas!,
    };

    this.serv.getAll().subscribe({
      next: (salas) => {
        const yaExiste = salas.some((s) => s.numero === newSala.numero);

        if (yaExiste) {
          this.numeroOcupado = true;
          this.uiAlert.show({
            variant: 'warning',
            tone: 'soft',
            title: 'Warning alert',
            message: 'Ese número de sala ya está ocupado.',
            timeoutMs: 4500,
          });
          return;
        }

        this.serv.create(newSala).subscribe({
          next: () => {
            this.uiAlert.show({
              variant: 'success',
              tone: 'soft',
              title: 'Success alert',
              message: 'Sala creada con éxito',
              timeoutMs: 3000,
            });
            this.route.navigateByUrl('/hall');
          },
          error: (e: unknown) => {
            console.error(e as any);
            this.uiAlert.show({
              variant: 'error',
              tone: 'soft',
              title: 'Error',
              message: 'Error al crear la sala',
              timeoutMs: 5000,
            });
          },
        });
      },
      error: (e: unknown) => {
        console.error(e as any);
        this.uiAlert.show({
          variant: 'error',
          tone: 'soft',
          title: 'Error',
          message: 'Error al verificar número de sala',
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
