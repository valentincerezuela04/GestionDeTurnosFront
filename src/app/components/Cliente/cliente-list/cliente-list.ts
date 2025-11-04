import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientesService } from '../../../services/Clientes/cliente-service';
import { Cliente } from '../../../models/usuarios/cliente';

@Component({
  selector: 'app-clientes-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: '\cliente-list.html',
  styleUrls: ['\cliente-list.css']
})
export class ClientesListComponent implements OnInit {

  clientes: Cliente[] = [];
  loading = false;
  error: string | null = null;

  clientesService = inject(ClientesService);

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
}
