import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
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
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  obtenerUsuarios(): void {
    this.usuariosService.obtenerUsuarios(this.pagina(), this.nombreApellidos(), this.activoValue()).subscribe({
      next: (response) => {
        this.usuariosPaginados.set(response);
      },
      error: (err) => {
        console.error('Error al obtener datos:', err);
      }
    });
  }

  modificarQueryParams(): void {
    let queryParams:{activo?: string, nombreApellidos?: string, pagina?:number} = {};

    if (!this.activoValue()) {
      queryParams = {...queryParams, activo: "false"};
    }

    if (/.*\S.*/.test(this.nombreApellidos())) {
      queryParams = {...queryParams, nombreApellidos: this.nombreApellidos()}
    }

    if (this.pagina() != 1) {
      queryParams = {...queryParams, pagina: this.pagina()}
    }

    this.router.navigate([], {
      queryParams: queryParams,
      relativeTo: this.route
    });

  }

  leerQueryParams(): void{
    this.route.queryParams.subscribe(params => {
      if (params["pagina"]) {
        this.pagina.set(Number(params["pagina"]));
      }

      if (params["nombreApellidos"]) {
        this.nombreApellidos.set(params["nombreApellidos"]);
      }

      if (params["activo"]) {
        this.activoValue.set(false);
      }
    });
  }


  ngOnInit(): void {
    this.leerQueryParams();
    this.obtenerUsuarios();
  }

  seleccionarEstado(activo: boolean): void {
    this.activoValue.set(activo);
    this.modificarQueryParams();
    this.obtenerUsuarios();
  }

  manejarBusqueda(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (this.temporizadorBusqueda) {
      clearTimeout(this.temporizadorBusqueda);
    }

    this.temporizadorBusqueda = setTimeout(() => {
      this.nombreApellidos.set(input.value);
      this.modificarQueryParams();
      this.obtenerUsuarios();
    }, 300);
  }
}
