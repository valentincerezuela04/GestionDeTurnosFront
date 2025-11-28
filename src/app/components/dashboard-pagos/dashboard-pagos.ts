import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ReservaService } from '../../services/Reservas/reservas-service';
import { ReservaResponseDTO } from '../../dto/Reserva';
import { catchError, combineLatest, of } from 'rxjs';
import { Router } from '@angular/router';

type MetodoPago =
  | 'EFECTIVO'
  | 'TARJETA'
  | 'TRANSFERENCIA'
  | 'MERCADO_PAGO'
  | 'NO_INFORMADO';

interface PagoReserva {
  id: number;
  fecha: string;
  clienteEmail: string;
  metodoPago: MetodoPago;
  monto: number;
  estado: 'PAGADA' | 'PENDIENTE_PAGO' | 'CANCELADA';
}

interface MetodoPagoResumen {
  metodo: MetodoPago;
  cantidad: number;
  monto: number;
}

@Component({
  selector: 'app-resumen-pagos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-pagos.html',
  styleUrls: ['./dashboard-pagos.css'],
})
export class DashboardPagos implements OnInit {
  private readonly reservaSrv = inject(ReservaService);
  private readonly router = inject(Router);

  pagos: PagoReserva[] = [];
  pagosPendientes: PagoReserva[] = [];

  resumenPorMetodo: MetodoPagoResumen[] = [];

  totalPendientePago = 0;

  totalReservasPagadas = 0;
  totalMontoPagado = 0;
  promedioPorReserva = 0;
  totalPendientes = 0;
  totalCanceladas = 0;

  ultimosPagos: PagoReserva[] = [];

  ngOnInit(): void {
    this.cargarDatos();
  }

  private cargarDatos(): void {
    combineLatest([
      this.reservaSrv.getHistorialGeneral().pipe(
        catchError((err) => {
          console.error(
            'Error al cargar historial general para dashboard de pagos',
            err
          );
          return of<ReservaResponseDTO[]>([]);
        })
      ),
      this.reservaSrv.getReservasActivas().pipe(
        catchError((err) => {
          console.error(
            'Error al cargar reservas activas para dashboard de pagos',
            err
          );
          return of<ReservaResponseDTO[]>([]);
        })
      ),
    ]).subscribe({
      next: ([historial, activas]) => {
        const reservasCompletas = this.mezclarReservas(
          historial ?? [],
          activas ?? []
        );
        this.pagos = this.mapearReservas(reservasCompletas);
        this.calcularResumen();
      },
      error: (err) => {
        console.error('Error inesperado en dashboard de pagos', err);
        this.pagos = [];
        this.calcularResumen();
      },
    });
  }

  private mapearReservas(reservas: ReservaResponseDTO[]): PagoReserva[] {
    return reservas.map((r) => {
      // Si el backend no envía tipoPago, lo consideramos "NO_INFORMADO"
      const metodoPago: MetodoPago = (r.tipoPago as MetodoPago) || 'NO_INFORMADO';

      const estadoBack = (r.estado ?? '').toUpperCase();

      let estado: PagoReserva['estado'];

      if (estadoBack === 'CANCELADO') {
        estado = 'CANCELADA';
      } else if (metodoPago !== 'NO_INFORMADO' || estadoBack === 'FINALIZADO') {
        // Si ya tiene método de pago o está finalizada en el back → la consideramos pagada
        estado = 'PAGADA';
      } else {
        // Todo lo que no tiene pago registrado ni está cancelada → pendiente de pago
        estado = 'PENDIENTE_PAGO';
      }

      return {
        id: r.id,
        // dejamos la fecha en ISO y la formateamos con formatFecha() en el template
        fecha: r.fechaInicio,
        clienteEmail: r.clienteEmail ?? 'N/A',
        metodoPago,
        // en tu DTO la propiedad es "monto", no "precioFinal"
        monto: r.monto ?? 0,
        estado,
      };
    });
  }

  private mezclarReservas(
    historial: ReservaResponseDTO[],
    activas: ReservaResponseDTO[]
  ): ReservaResponseDTO[] {
    const mapa = new Map<number, ReservaResponseDTO>();

    [...historial, ...activas].forEach((r) => mapa.set(r.id, r));

    return Array.from(mapa.values());
  }

  private calcularResumen(): void {
    const pagadas = this.pagos.filter((p) => p.estado === 'PAGADA');
    const pendientes = this.pagos.filter(
      (p) => p.estado === 'PENDIENTE_PAGO'
    );
    const canceladas = this.pagos.filter((p) => p.estado === 'CANCELADA');

    // lista de pendientes para el panel del empleado
    this.pagosPendientes = pendientes;

    this.totalReservasPagadas = pagadas.length;
    this.totalPendientes = pendientes.length;
    this.totalCanceladas = canceladas.length;

    this.totalMontoPagado = pagadas.reduce((acc, p) => acc + p.monto, 0);
    this.totalPendientePago = pendientes.reduce((acc, p) => acc + p.monto, 0);

    this.promedioPorReserva =
      pagadas.length > 0 ? this.totalMontoPagado / pagadas.length : 0;

    const mapa = new Map<MetodoPago, MetodoPagoResumen>();

    pagadas.forEach((p) => {
      const actual =
        mapa.get(p.metodoPago) ?? {
          metodo: p.metodoPago,
          cantidad: 0,
          monto: 0,
        };

      actual.cantidad += 1;
      actual.monto += p.monto;
      mapa.set(p.metodoPago, actual);
    });

    this.resumenPorMetodo = Array.from(mapa.values());

    this.ultimosPagos = [...pagadas]
      .sort(
        (a, b) =>
          new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
      )
      .slice(0, 10);
  }

  verDetalle(reservaId: number): void {
    this.router.navigate(['/reservas', reservaId, 'details']);
  }

  formatFecha(fechaIso: string): string {
    const d = new Date(fechaIso);
    return d.toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
