// src/app/components/Pagos/resumen-pagos/resumen-pagos.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

type MetodoPago = 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA' | 'MERCADO_PAGO';

interface PagoReservaMock {
  id: number;
  fecha: string;      // ISO string
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

  // 🔹 Datos mock de ejemplo (simulando reservas pagadas, pendientes, etc.)
  pagos: PagoReservaMock[] = [
    {
      id: 1,
      fecha: '2025-11-20T10:00:00',
      clienteEmail: 'cliente1@example.com',
      metodoPago: 'MERCADO_PAGO',
      monto: 15000,
      estado: 'PAGADA',
    },
    {
      id: 2,
      fecha: '2025-11-21T15:30:00',
      clienteEmail: 'cliente2@example.com',
      metodoPago: 'TARJETA',
      monto: 22000,
      estado: 'PAGADA',
    },
    {
      id: 3,
      fecha: '2025-11-22T09:00:00',
      clienteEmail: 'cliente3@example.com',
      metodoPago: 'EFECTIVO',
      monto: 8000,
      estado: 'PAGADA',
    },
    {
      id: 4,
      fecha: '2025-11-23T18:00:00',
      clienteEmail: 'cliente4@example.com',
      metodoPago: 'MERCADO_PAGO',
      monto: 18000,
      estado: 'PENDIENTE_PAGO',
    },
    {
      id: 5,
      fecha: '2025-11-24T11:15:00',
      clienteEmail: 'cliente5@example.com',
      metodoPago: 'TRANSFERENCIA',
      monto: 12000,
      estado: 'CANCELADA',
    },
  ];

  // 🔹 KPIs generales
  totalReservasPagadas = 0;
  totalMontoPagado = 0;
  promedioPorReserva = 0;

  // 🔹 Extra: cuentas por estado
  totalPendientes = 0;
  totalCanceladas = 0;

  // 🔹 Estadísticas por método de pago
  resumenPorMetodo: MetodoPagoResumen[] = [];

  // 🔹 Últimos pagos (para mostrar abajo en tabla)
  ultimosPagos: PagoReservaMock[] = [];

  ngOnInit(): void {
    this.calcularResumen();
  }

  private calcularResumen(): void {
    const pagadas = this.pagos.filter((p) => p.estado === 'PAGADA');
    const pendientes = this.pagos.filter((p) => p.estado === 'PENDIENTE_PAGO');
    const canceladas = this.pagos.filter((p) => p.estado === 'CANCELADA');

    this.totalReservasPagadas = pagadas.length;
    this.totalPendientes = pendientes.length;
    this.totalCanceladas = canceladas.length;

    this.totalMontoPagado = pagadas.reduce((acc, p) => acc + p.monto, 0);
    this.promedioPorReserva =
      pagadas.length > 0 ? Math.round(this.totalMontoPagado / pagadas.length) : 0;

    // Agrupamos por método de pago
    const mapa = new Map<MetodoPago, MetodoPagoResumen>();

    for (const pago of pagadas) {
      if (!mapa.has(pago.metodoPago)) {
        mapa.set(pago.metodoPago, {
          metodo: pago.metodoPago,
          cantidad: 0,
          monto: 0,
        });
      }
      const entry = mapa.get(pago.metodoPago)!;
      entry.cantidad += 1;
      entry.monto += pago.monto;
    }

    this.resumenPorMetodo = Array.from(mapa.values());

    // Últimos pagos: ordenados por fecha desc, tomamos 5
    this.ultimosPagos = [...this.pagos]
      .filter((p) => p.estado === 'PAGADA')
      .sort((a, b) => +new Date(b.fecha) - +new Date(a.fecha))
      .slice(0, 5);
  }

  // Helper para mostrar fecha bonita
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
