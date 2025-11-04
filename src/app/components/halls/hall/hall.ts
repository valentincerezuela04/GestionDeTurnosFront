import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CardHall } from "../card-hall/card-hall";
import { SalasService } from '../../../services/Salas/salas-service';
import { Router, RouterLink } from '@angular/router';


@Component({
  selector: 'app-hall',
  imports: [CardHall,RouterLink],
  templateUrl: './hall.html',
  styleUrl: './hall.css',
})
export class Hall {
  serv = inject(SalasService)
  router = inject(Router)


  hallList = toSignal(this.serv.getAll(),{initialValue: []})


  deleteSala(id:number){
   this.serv.canDelete(id).subscribe({
      next: (canDelete) => {
        if (!canDelete) {
          alert('No se puede eliminar la sala porque tiene turnos asociados.');
          return;
        }

        this.serv.delete(id).subscribe({
          next: () => {
            

            
               this.router.navigateByUrl('/hall').then(() => {
              alert('Sala eliminada con éxito');
            });
          },
          error: (err) => {
            console.error(err);
            alert('Error al eliminar la sala');
          },
        });
      },
      error: (err) => {
        console.error(err);
        alert('No se pudo verificar si se puede eliminar.');
      },
    });
  }
}

