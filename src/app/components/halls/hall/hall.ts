import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CardHall } from "../card-hall/card-hall";
import { SalasService } from '../../../services/Salas/salas-service';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/Auth/auth-service';
import { AppRole } from '../../../models/auth.model';
import { UiAlertService } from '../../../services/Ui-alert/ui-alert';


@Component({
  selector: 'app-hall',
  imports: [CardHall,RouterLink],
  templateUrl: './hall.html',
  styleUrl: './hall.css',
})
export class Hall {
  serv = inject(SalasService)
  router = inject(Router)
  private auth = inject(AuthService);
  private uiAlert = inject(UiAlertService);


  hallList = toSignal(this.serv.getAll(),{initialValue: []})
  private readonly role = computed(() => this.auth.user()?.rol as AppRole | null);
  readonly canCreate = computed(() => this.role() === 'ADMIN');
  readonly canEdit = computed(() => {
    const current = this.role();
    return current === 'ADMIN' || current === 'EMPLEADO';
  });
  readonly canDelete = computed(() => this.role() === 'ADMIN');


  deleteSala(id:number){
   this.serv.canDelete(id).subscribe({
      next: (canDelete) => {
        if (!canDelete) {
          this.uiAlert.show({
  variant: 'warning',
  tone: 'soft',
  title: 'Warning alert',
  message: 'No se puede eliminar la sala porque tiene turnos asociados.',
  timeoutMs: 4500,
});

          return;
        }

        this.serv.delete(id).subscribe({
          next: () => {
            

            
               this.router.navigateByUrl('/hall').then(() => {
              this.uiAlert.show({
  variant: 'success',
  tone: 'soft',
  title: 'Success alert',
  message: 'Sala eliminada con éxito',
  timeoutMs: 3000,
});

            });
          },
          error: (err) => {
            console.error(err);
            this.uiAlert.show({
  variant: 'error',
  tone: 'soft',
  title: 'Error',
  message: 'Error al eliminar la sala',
  timeoutMs: 5000,
});

          },
        });
      },
      error: (err) => {
        console.error(err);
        this.uiAlert.show({
  variant: 'error',
  tone: 'outline',
  title: 'Error',
  message: 'No se pudo verificar si se puede eliminar.',
  timeoutMs: 5000,
});

      },
    });
  }
}

