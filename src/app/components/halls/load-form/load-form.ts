import { jsDocComment } from '@angular/compiler';
import { Component, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SalasService } from '../../../services/Salas/salas-service';
import { Router } from '@angular/router';
import { CreateSalaDTO, SalaDTO, SalaSize } from '../../../models/sala';

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

  //para mostrar error en el html
  numeroOcupado = false

  // mapa para mostrar la capacidad fija segun el tamano
  capacidadPorSize: Record<SalaSize, number> = {
    PEQUENA: 10,
    'PEQUEÑA': 10,
    MEDIANA: 25,
    GRANDE: 40,
  };

  form = this.fb.group({
    numero: [0,[Validators.required,Validators.min(1)]],
    descripcion: ['',[Validators.required,Validators.minLength(6)]],
    salaSize: ['MEDIANA' as SalaSize | null, [Validators.required]],
    cantidad_personas: [0, [Validators.required]],
  });

    get capacidadSeleccionada(): number | null {
    const size = this.form.value.salaSize;
    return size ? this.capacidadPorSize[size] : null;
  }


   ngOnInit(): void {
    // setear cantidad_personas según el tamaño inicial
    const sizeInicial = this.form.value.salaSize as SalaSize | null;
    if (sizeInicial) {
      this.form.patchValue(
        { cantidad_personas: this.capacidadPorSize[sizeInicial] },
        { emitEvent: false }
      );
    }

    // actualizar cantidad_personas cuando cambie salaSize
    this.form.get('salaSize')?.valueChanges.subscribe((size) => {
      if (!size) return;
      const capacidad = this.capacidadPorSize[size as SalaSize];
      this.form.patchValue(
        { cantidad_personas: capacidad },
        { emitEvent: false }
      );
    });
  }
  submit() {
    if(this.form.invalid) {
      this.form.markAllAsTouched();
      return};
        const raw = this.form.getRawValue();

      const newSala: CreateSalaDTO = {
      numero: raw.numero!,
      descripcion: raw.descripcion!,
      salaSize: raw.salaSize as SalaSize,
      cantidad_personas: raw.cantidad_personas!,
    };

      this.serv.getAll().subscribe({
      next: (salas) => {
        const yaExiste = salas.some(s => s.numero === newSala.numero);

        if (yaExiste) {
          this.numeroOcupado = true;
          return;
        }


      this.serv.create(newSala).subscribe({
      next: () => {
        alert('Sala creada con éxito');
        this.route.navigateByUrl('/hall');
      },
      error: (e) => {
        alert('Error al crear la sala');
        console.error(e);
      }
      })


  
    ;
  },    error: (e) => {
        alert('Error al verificar número de sala');
        console.error(e);
      }
    });
  }
}
