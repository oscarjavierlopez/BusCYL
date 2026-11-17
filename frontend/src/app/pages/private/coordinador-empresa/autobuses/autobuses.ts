import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toast, NgxSonnerToaster } from 'ngx-sonner';
import { AutobusService } from '../../../../services/autobus.service';
import { AutobusesPaginados } from '../../../../models/autobuses-paginados';

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
  selector: 'app-autobuses',
  imports: [RouterLink, NgxSonnerToaster],
  templateUrl: './autobuses.html',
  styleUrl: './autobuses.css',
})
export class Autobuses implements OnInit {
  private autobusesService = inject(AutobusService);
  autobusesPaginados = signal<AutobusesPaginados | null>(null);
  matricula = signal<string>('');
  pagina = signal<number>(1);
  private temporizadorBusqueda: ReturnType<typeof setTimeout> | null = null;
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  private obtenerAutobuses(): void {
    this.autobusesService.obtenerAutobusesPaginados(this.pagina(), this.matricula()).subscribe({
      next: (response) => {
        this.autobusesPaginados.set(response);
      },
      error: (err) => {
        console.error('Error al obtener datos:', err);
      }
    });
  }

  modificarQueryParams(): void {
    let queryParams: { matricula?: string, pagina?: number } = {};

    if (/.*\S.*/.test(this.matricula())) {
      queryParams = { ...queryParams, matricula: this.matricula() }
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

      if (params["matricula"]) {
        this.matricula.set(params["matricula"]);
      }
    });
  }

  ngOnInit(): void {
    this.leerQueryParams();
    this.obtenerAutobuses();
  }

  manejarBusqueda(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (this.temporizadorBusqueda) {
      clearTimeout(this.temporizadorBusqueda);
    }

    this.temporizadorBusqueda = setTimeout(() => {
      this.matricula.set(input.value);
      this.pagina.set(1);
      this.modificarQueryParams();
      this.obtenerAutobuses();
    }, 300);
  }

  cambiarPagina(pagina: number): void {
    this.pagina.set(pagina);
    this.modificarQueryParams()
    this.obtenerAutobuses();
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

  private modificarClaseAutobus(id: number): void {
    this.autobusesPaginados.update((paginaAutobuses) => {
      if (!paginaAutobuses) {
        return null;
      }

      return {
        ...paginaAutobuses,
        autobuses: paginaAutobuses.autobuses.map((autobus) =>
          autobus.id === id ? { ...autobus, activo: autobus.activo === false } : autobus,
        ),
      };
    });
  }

  desactivarAutobus(id: number, matricula: string): void {
    this.confirmarCambioEstado(`¿Desea deshabilitar el autobus con matrícula ${matricula}?`, '#a6001c', () => {
      this.autobusesService.desactivarAutobus(id).subscribe({
        next: () => {
          this.modificarClaseAutobus(id);
          toast.info(`El autobús con matrícula ${matricula} ha sido desactivado`)
        },
      });
    });
  }

  activarAutobus(id: number, matricula: string): void {
    this.confirmarCambioEstado(`¿Desea deshabilitar el autobus con matrícula ${matricula}?`, '#2f6b45', () => {
      this.autobusesService.activarAutobus(id).subscribe({
        next: () => {
          this.modificarClaseAutobus(id);
          toast.info(`El autobús con matrícula ${matricula} ha sido activado`)

        },
      });
    });
  }
}
