import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UsuariosService } from '../../../../services/usuarios.service';
import { UsuariosPaginados } from '../../../../models/usuarios-paginados';

@Component({
  selector: 'app-usuarios',
  imports: [RouterLink],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.css',
})
export class Usuarios implements OnInit {
  private usuariosService = inject(UsuariosService);
  usuariosPaginados = signal<UsuariosPaginados | null>(null);
  nombreApellidos = signal<string>('');
  activoValue = signal<boolean>(true);
  pagina = signal<number>(1);
  private temporizadorBusqueda: ReturnType<typeof setTimeout> | null = null;

  obtenerUsuarios(): void{
    this.usuariosService.obtenerUsuarios(this.pagina(), this.nombreApellidos(), this.activoValue()).subscribe({
      next: (response) => {
        this.usuariosPaginados.set(response);
      },
      error: (err) => {
        console.error('Error al obtener datos:', err);
      }
    });
  }


  ngOnInit(): void {
    this.obtenerUsuarios();
  }

  seleccionarEstado(activo: boolean): void {
    this.activoValue.set(activo);
    this.obtenerUsuarios();
  }

  manejarBusqueda(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (this.temporizadorBusqueda) {
      clearTimeout(this.temporizadorBusqueda);
    }

    this.temporizadorBusqueda = setTimeout(() => {
      this.nombreApellidos.set(input.value);
      this.obtenerUsuarios();
    }, 300);
  }
}
