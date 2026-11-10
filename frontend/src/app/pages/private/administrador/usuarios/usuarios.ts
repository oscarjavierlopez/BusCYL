import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UsuariosService } from '../../../../services/usuarios.service';
import { UsuariosPaginados } from '../../../../models/usuarios-paginados';
import { toast, NgxSonnerToaster } from 'ngx-sonner';
import { InvitacionesService } from '../../../../services/invitaciones.service';

declare const Swal: {
  fire: (options: {
    title: string;
    icon: 'question';
    showCancelButton: boolean;
    confirmButtonText: string;
    cancelButtonText: string;
    confirmButtonColor: string;
  }) => Promise<{ isConfirmed: boolean }>;
};

@Component({
  selector: 'app-usuarios',
  imports: [RouterLink, NgxSonnerToaster],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.css',
})
export class Usuarios implements OnInit {
  private usuariosService = inject(UsuariosService);
  private invitacionesService = inject(InvitacionesService);
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
    let queryParams: { activo?: string, nombreApellidos?: string, pagina?: number } = {};

    if (!this.activoValue()) {
      queryParams = { ...queryParams, activo: "false" };
    }

    if (/.*\S.*/.test(this.nombreApellidos())) {
      queryParams = { ...queryParams, nombreApellidos: this.nombreApellidos() }
    }

    if (this.pagina() != 1) {
      queryParams = { ...queryParams, pagina: this.pagina() }
    }

    this.router.navigate([], {
      queryParams: queryParams,
      relativeTo: this.route
    });

  }

  leerQueryParams(): void {
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
    this.pagina.set(1);
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
      this.pagina.set(1);
      this.modificarQueryParams();
      this.obtenerUsuarios();
    }, 300);
  }

  cambiarPagina(pagina: number): void {
    this.pagina.set(pagina);
    this.modificarQueryParams()
    this.obtenerUsuarios();
  }

  private confirmarCambioEstado(mensaje: string, colorConfirmacion: string, accion: () => void): void {
    Swal.fire({
      title: mensaje,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: colorConfirmacion,
    }).then((result) => {
      if (result.isConfirmed) {
        accion();
      }
    });
  }

  private eliminarUsuarioPaginado(id: number): void {
    this.usuariosPaginados.update((paginaUsuarios) => {
      if (!paginaUsuarios) {
        return null;
      }

      return {
        ...paginaUsuarios,
        usuarios: paginaUsuarios.usuarios.filter((usuario) => usuario.id !== id),
      };
    });
  }

  desactivarUsuario(id: number, email: string): void {
    this.confirmarCambioEstado(`¿desea desactivar el usuario ${email}?`, '#a6001c', () => {
      this.usuariosService.desactivarUsuario(id).subscribe({
        next: () => {
          this.eliminarUsuarioPaginado(id);
          toast.info(`El usuario ${email} ha sido desactivado`)
        },
      });
    });
  }

  activarUsuario(id: number, email: string): void {
    this.confirmarCambioEstado(`¿desea activar el usuario ${email}?`, '#2f6b45', () => {
      this.usuariosService.activarUsuario(id).subscribe({
        next: () => {
          this.eliminarUsuarioPaginado(id);
          toast.info(`El usuario ${email} ha sido activado`)
        },
      });
    });
  }

  enviarInvitacion(email: string): void {
    this.confirmarCambioEstado(`¿Desea enviar invitación al usuario ${email}?`, '#1a73a8', () => {
      this.invitacionesService.enviarInvitacion({ email: email }).subscribe(
        {
          next: () => {
            toast.info(`Se envió una invitación al usuario ${email}`)
          },
          error: (err) => {
            toast.error(err.error.error);
          }
        }
      );
    });
  }
}
