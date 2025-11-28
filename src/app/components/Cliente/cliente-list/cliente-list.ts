import { Component, inject, OnInit, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientesService } from '../../../services/Clientes/cliente-service';
import { Cliente } from '../../../models/usuarios/cliente';
import { AuthService } from '../../../services/Auth/auth-service';

@Component({
  selector: 'app-clientes-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cliente-list.component.html',
  styleUrls: ['./cliente-list.component.css']
})
export class ClientesListComponent implements OnInit {

  clientes: Cliente[] = [];
  loading = false;
  error: string | null = null;

  readonly seleccionarCliente = output<Cliente>();

  clientesService = inject(ClientesService);
  private auth = inject(AuthService);
  eliminandoIds = new Set<number>();

  ngOnInit(): void {
    this.cargarClientes();
  }

  cargarClientes(): void {
    this.loading = true;
    this.error = null;

    this.clientesService.getAll().subscribe({
      next: (data) => {
        this.clientes = data;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'Error al cargar los clientes';
        this.loading = false;
      }
    });
  }

  seleccionar(cliente: Cliente): void {
    this.seleccionarCliente.emit(cliente);
  }

  get esAdmin(): boolean {
    return this.auth.hasRole('ADMIN');
  }

  eliminarCliente(event: Event, cliente: Cliente): void {
    event.stopPropagation();
    event.preventDefault();

    if (!this.esAdmin) return;
    if (!confirm('Eliminar definitivamente este cliente?')) return;

    this.eliminandoIds.add(cliente.id);
    this.clientesService.delete(cliente.id).subscribe({
      next: () => {
        this.clientes = this.clientes.filter((c) => c.id !== cliente.id);
      },
      error: (err) => {
        console.error(err);
        this.error = 'No se pudo eliminar el cliente.';
        this.eliminandoIds.delete(cliente.id);
      },
      complete: () => {
        this.eliminandoIds.delete(cliente.id);
      }
    });
  }
}
