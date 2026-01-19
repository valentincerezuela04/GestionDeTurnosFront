import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { Subject, startWith, switchMap } from 'rxjs';
import { CardHall } from "../card-hall/card-hall";
import { SalasService } from '../../../services/Salas/salas-service';
import { AuthService } from '../../../services/Auth/auth-service';
import { AppRole } from '../../../models/auth.model';
import { UiAlertService } from '../../../services/Ui-alert/ui-alert';
import { ReservaService } from '../../../services/Reservas/reservas-service';


@Component({
  selector: 'app-hall',
  imports: [CardHall,RouterLink],
  templateUrl: './hall.html',
  styleUrl: './hall.css',
})
export class Hall {
  serv = inject(SalasService)
  private auth = inject(AuthService);
  private uiAlert = inject(UiAlertService);
  private reservas = inject(ReservaService);

  private readonly refresh$ = new Subject<void>();
  hallList = toSignal(
    this.refresh$.pipe(
      startWith(void 0),
      switchMap(() => this.serv.getAll())
    ),
    { initialValue: [] }
  );
  private readonly role = computed(() => this.auth.user()?.rol as AppRole | null);
  readonly canCreate = computed(() => this.role() === 'ADMIN');
  readonly canEdit = computed(() => {
    const current = this.role();
    return current === 'ADMIN' || current === 'EMPLEADO';
  });
  readonly canDelete = computed(() => this.role() === 'ADMIN');


  deleteSala(id: number) {
    const hall = this.hallList().find((item) => item.id === id);
    if (!hall) {
      this.uiAlert.show({
        variant: 'error',
        tone: 'soft',
        title: 'Error',
        message: 'No se encontró la sala para eliminar.',
        timeoutMs: 4000,
      });
      return;
    }

    this.reservas.getReservasActivas().subscribe({
      next: (reservas) => {
        const hasActive = reservas.some((reserva) => reserva.salaNumero === hall.numero);
        if (hasActive) {
          this.uiAlert.show({
            variant: 'warning',
            tone: 'soft',
            title: 'Warning alert',
            message: 'No se puede eliminar la sala porque tiene reservas activas.',
            timeoutMs: 4500,
          });
          return;
        }

        this.serv.delete(id).subscribe({
          next: () => {
            this.refresh$.next();
            this.uiAlert.show({
              variant: 'success',
              tone: 'soft',
              title: 'Success alert',
              message: 'Sala eliminada con éxito',
              timeoutMs: 3000,
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
          tone: 'soft',
          title: 'Error',
          message: 'No se pudo verificar reservas activas.',
          timeoutMs: 5000,
        });
      },
    });
  }
}

