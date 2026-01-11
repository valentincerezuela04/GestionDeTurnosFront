// dashboard-pagos.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, combineLatest, of } from 'rxjs';

import { ReservaService } from '../../services/Reservas/reservas-service';
import { ReservaResponseDTO } from '../../dto/Reserva';

import { NgApexchartsModule } from 'ng-apexcharts';
import type {
  ApexAxisChartSeries,
  ApexNonAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexStroke,
  ApexDataLabels,
  ApexFill,
  ApexGrid,
  ApexTooltip,
  ApexLegend,
  ApexResponsive,
} from 'ng-apexcharts';

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

interface GananciaPorMes {
  mes: string; // "2025-11"
  monto: number;
}

type VistaDashboard = 'RESUMEN' | 'CHARTS';

type ChartArea = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  stroke: ApexStroke;
  dataLabels: ApexDataLabels;
  fill: ApexFill;
  grid: ApexGrid;
  tooltip: ApexTooltip;
  colors: string[];
};

type ChartDonut = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  labels: string[];
  legend: ApexLegend;
  colors: string[];
  responsive: ApexResponsive[];
};

@Component({
  selector: 'app-resumen-pagos',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './dashboard-pagos.html',
  styleUrls: ['./dashboard-pagos.css'],
})
export class DashboardPagos implements OnInit {
  private readonly reservaSrv = inject(ReservaService);
  private readonly router = inject(Router);

  // ===== Toggle vista =====
  readonly vista = signal<VistaDashboard>('RESUMEN');
  readonly esCharts = computed(() => this.vista() === 'CHARTS');

  cambiarVista(v: VistaDashboard) {
    this.vista.set(v);

    // anti “chart en blanco” al mostrarse en un bloque condicional
    if (v === 'CHARTS') {
      setTimeout(() => window.dispatchEvent(new Event('resize')), 0);
    }
  }

  // ===== Datos =====
  pagos: PagoReserva[] = [];
  pagosPendientes: PagoReserva[] = [];
  gananciasPorMes: GananciaPorMes[] = [];
  resumenPorMetodo: MetodoPagoResumen[] = [];

  totalPendientePago = 0;

  totalReservasPagadas = 0;
  totalMontoPagado = 0;
  promedioPorReserva = 0;
  totalPendientes = 0;
  totalCanceladas = 0;

  ultimosPagos: PagoReserva[] = [];

  // ===== Charts (NO undefined) =====
  chartGanancias: ChartArea = {
    series: [{ name: 'Cobrado', data: [] }],
    chart: {
      type: 'area',
      height: 320,
      toolbar: { show: false },
      zoom: { enabled: false },
      animations: { enabled: true },
    },
    xaxis: { categories: [] },
    stroke: { curve: 'straight', width: 2 },
    dataLabels: { enabled: false },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.55,
        opacityTo: 0.12,
        stops: [0, 85, 100],
      },
    },
    grid: {
      strokeDashArray: 2,
      borderColor: 'color-mix(in oklab, var(--text) 22%, transparent)',
    },
    tooltip: {
      y: {
        formatter: (v: number) =>
          `$ ${Math.round(v).toLocaleString('es-AR')}`,
      },
    },
    colors: ['var(--accent-500)'],
  };

  chartMetodos: ChartDonut = {
    series: [],
    chart: { type: 'donut', height: 320, animations: { enabled: true } },
    labels: [],
    legend: { position: 'bottom' },
    colors: [
      'var(--accent-500)',
      'var(--accent-400)',
      'var(--accent-300)',
      'color-mix(in oklab, var(--accent-500) 55%, white)',
      'color-mix(in oklab, var(--accent-500) 35%, white)',
    ],
    responsive: [
      {
        breakpoint: 640,
        options: {
          chart: { height: 280 },
          legend: { position: 'bottom' },
        },
      },
    ],
  };

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
          console.error('Error al cargar reservas activas para dashboard de pagos', err);
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
      const metodoPago: MetodoPago =
        (r.tipoPago as MetodoPago) || 'NO_INFORMADO';

      const estadoBack = (r.estado ?? '').toUpperCase();
      let estado: PagoReserva['estado'];

      if (estadoBack === 'CANCELADO') {
        estado = 'CANCELADA';
      } else if (metodoPago !== 'NO_INFORMADO' || estadoBack === 'FINALIZADO') {
        estado = 'PAGADA';
      } else {
        estado = 'PENDIENTE_PAGO';
      }

      return {
        id: r.id,
        fecha: r.fechaInicio,
        clienteEmail: r.clienteEmail ?? 'N/A',
        metodoPago,
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
    const pendientes = this.pagos.filter((p) => p.estado === 'PENDIENTE_PAGO');
    const canceladas = this.pagos.filter((p) => p.estado === 'CANCELADA');

    this.pagosPendientes = pendientes;

    this.totalReservasPagadas = pagadas.length;
    this.totalPendientes = pendientes.length;
    this.totalCanceladas = canceladas.length;

    this.totalMontoPagado = pagadas.reduce((acc, p) => acc + p.monto, 0);
    this.totalPendientePago = pendientes.reduce((acc, p) => acc + p.monto, 0);

    this.promedioPorReserva =
      pagadas.length > 0 ? this.totalMontoPagado / pagadas.length : 0;

    // Ganancias por mes (solo pagadas)
    const mapaMes = new Map<string, number>();
    pagadas.forEach((p) => {
      const fecha = new Date(p.fecha);
      const year = fecha.getFullYear();
      const month = String(fecha.getMonth() + 1).padStart(2, '0');
      const key = `${year}-${month}`;
      mapaMes.set(key, (mapaMes.get(key) ?? 0) + p.monto);
    });

    this.gananciasPorMes = Array.from(mapaMes.entries())
      .map(([mes, monto]) => ({ mes, monto }))
      .sort((a, b) => a.mes.localeCompare(b.mes));

    // Resumen por método (solo pagadas)
    const mapaMetodo = new Map<MetodoPago, MetodoPagoResumen>();
    pagadas.forEach((p) => {
      const actual =
        mapaMetodo.get(p.metodoPago) ?? {
          metodo: p.metodoPago,
          cantidad: 0,
          monto: 0,
        };

      actual.cantidad += 1;
      actual.monto += p.monto;
      mapaMetodo.set(p.metodoPago, actual);
    });
    this.resumenPorMetodo = Array.from(mapaMetodo.values());

    // Últimos pagos
    this.ultimosPagos = [...pagadas]
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
      .slice(0, 10);

    // Charts
    this.buildCharts();
  }

  private buildCharts(): void {
    // Ganancias por mes
    const meses = this.gananciasPorMes.map((g) => g.mes);
    const montos = this.gananciasPorMes.map((g) => g.monto);

    this.chartGanancias = {
      ...this.chartGanancias,
      series: [{ name: 'Cobrado', data: montos }],
      xaxis: { categories: meses },
    };

    // Donut por método
    const labels = this.resumenPorMetodo.map((r) => r.metodo);
    const series = this.resumenPorMetodo.map((r) => r.monto);

    this.chartMetodos = {
      ...this.chartMetodos,
      labels,
      series,
    };
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
