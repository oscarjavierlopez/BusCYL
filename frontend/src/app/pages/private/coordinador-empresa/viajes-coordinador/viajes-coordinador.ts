import { Component, inject, OnInit, signal } from '@angular/core';
import { ViajesService } from '../../../../services/viajes.service';
import { LocalidadesService } from '../../../../services/localidades.service';
import { Localidad } from '../../../../models/localidad';
import { ViajeCard } from '../../../../components/viaje-card/viaje-card';
import { ViajesPaginados } from '../../../../models/viajes-paginados';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgxSonnerToaster, toast } from 'ngx-sonner';

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
  selector: 'app-viajes-coordinador',
  imports: [RouterLink, ViajeCard, NgxSonnerToaster],
  templateUrl: './viajes-coordinador.html',
  styleUrl: './viajes-coordinador.css',
})
export class ViajesCoordinador implements OnInit {
  private viajesService = inject(ViajesService);
  private localidadesService = inject(LocalidadesService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);


  viajesPaginados = signal<ViajesPaginados | null>(null);
  localidades = signal<Localidad[]>([]);
  localidadesOrigenFiltradas = signal<Localidad[]>([]);
  localidadesDestinoFiltradas = signal<Localidad[]>([]);

  origen = signal<number | null>(null);
  destino = signal<number | null>(null);
  fecha = signal<string | null>(null);
  pagina = signal<number>(1);
  busquedaOrigen = signal<string>('');
  busquedaDestino = signal<string>('');
  mostrarSugerenciasOrigen = signal<boolean>(false);
  mostrarSugerenciasDestino = signal<boolean>(false);
  errorOrigen = signal<boolean>(false);
  errorDestino = signal<boolean>(false);
  errorFecha = signal<boolean>(false);
  busquedaRealizada = signal<boolean>(false);

  ngOnInit(): void {
    this.localidadesService.obtenerLocalidades()
      .subscribe({
        next: (localidades) => {
          this.localidades.set(localidades);
          this.leerQueryParams();
          this.buscar()
        },
        error: (error) => {
          console.error('Ocurrió un error:', error);
        }
      });
  }

  changeOrigen(id: number): void {
    this.limpiarErrores();
    this.origen.set(id);
    this.busquedaOrigen.set(this.obtenerNombreLocalidad(id));
    this.localidadesOrigenFiltradas.set([]);
    this.mostrarSugerenciasOrigen.set(false);
  }

  changeDestino(id: number): void {
    this.limpiarErrores();
    this.destino.set(id);
    this.busquedaDestino.set(this.obtenerNombreLocalidad(id));
    this.localidadesDestinoFiltradas.set([]);
    this.mostrarSugerenciasDestino.set(false);
  }

  changeFecha(event: Event): void {
    this.limpiarErrores();
    this.fecha.set((event.target as HTMLInputElement).value || null);
  }

  manejarBusquedaOrigen(event: Event): void {
    const textoBusqueda = (event.target as HTMLInputElement).value;

    this.limpiarErrores();
    this.busquedaOrigen.set(textoBusqueda);
    this.origen.set(null);
    this.mostrarSugerenciasOrigen.set(textoBusqueda.length > 0);
    this.localidadesOrigenFiltradas.set(this.filtrarLocalidades(textoBusqueda));
  }

  manejarBusquedaDestino(event: Event): void {
    const textoBusqueda = (event.target as HTMLInputElement).value;

    this.limpiarErrores();
    this.busquedaDestino.set(textoBusqueda);
    this.destino.set(null);
    this.mostrarSugerenciasDestino.set(textoBusqueda.length > 0);
    this.localidadesDestinoFiltradas.set(this.filtrarLocalidades(textoBusqueda));
  }

  buscar(): void {
    this.errorOrigen.set(this.origen() === null);
    this.errorDestino.set(this.destino() === null);
    this.errorFecha.set(this.fecha() === null);

    if (this.errorOrigen() || this.errorDestino() || this.errorFecha()) {
      return;
    }

    this.pagina.set(1);
    this.modificarQueryParams();
    this.obtenerViajes();
  }

  cambiarPagina(pagina: number): void {
    this.pagina.set(pagina);
    this.obtenerViajes();
  }

  resetearBusqueda(): void {
    this.origen.set(null);
    this.destino.set(null);
    this.fecha.set(null);
    this.busquedaOrigen.set('');
    this.busquedaDestino.set('');
    this.localidadesOrigenFiltradas.set([]);
    this.localidadesDestinoFiltradas.set([]);
    this.mostrarSugerenciasOrigen.set(false);
    this.mostrarSugerenciasDestino.set(false);
    this.viajesPaginados.set(null);
    this.pagina.set(1);
    this.busquedaRealizada.set(false);
    this.limpiarErrores();

    this.router.navigate([], {
      queryParams: {},
      relativeTo: this.route,
    });
  }

  private obtenerViajes(): void {
    this.busquedaRealizada.set(true);
    this.viajesService.obtenerViajesCoordinador(this.pagina(), this.origen()!, this.destino()!, this.fecha()!)
      .subscribe({
        next: (response) => {
          this.viajesPaginados.set(response);
        },
        error: (err) => {
          console.error('Error al obtener datos:', err);
        }
      });
  }

  private filtrarLocalidades(textoBusqueda: string): Localidad[] {
    const textoNormalizado = this.normalizarTexto(textoBusqueda);

    return textoNormalizado.length === 0
      ? []
      : this.localidades().filter((localidad) =>
        this.normalizarTexto(localidad.nombre).includes(textoNormalizado),
      );
  }

  private normalizarTexto(texto: string): string {
    return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es-ES');
  }

  private obtenerNombreLocalidad(id: number): string {
    return this.localidades().find((localidad) => localidad.id === id)?.nombre ?? '';
  }

  private limpiarErrores(): void {
    this.errorOrigen.set(false);
    this.errorDestino.set(false);
    this.errorFecha.set(false);
  }

  private modificarQueryParams(): void {
    let queryParams: { origen?: number, destino?: number, fecha: string, pagina?: number } = {
      origen: this.origen()!,
      destino: this.destino()!,
      fecha: this.fecha()!,
      pagina: this.pagina()
    }

    this.router.navigate([], {
      queryParams: queryParams,
      relativeTo: this.route
    });

  }

  private leerQueryParams(): void {
    this.route.queryParams.subscribe(params => {
      if (params["pagina"]) {
        this.pagina.set(Number(params["pagina"]));
      }

      if (params["origen"]) {
        const origen = Number(params["origen"]);

        this.origen.set(origen);
        this.busquedaOrigen.set(this.obtenerNombreLocalidad(origen));
      }

      if (params["destino"]) {
        const destino = Number(params["destino"]);

        this.destino.set(destino);
        this.busquedaDestino.set(this.obtenerNombreLocalidad(destino));
      }

      if (params["fecha"]) {
        const fecha = params["fecha"];

        this.fecha.set(fecha);
      }
    });
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

  private toggleActivo(id: number): void {
    this.viajesPaginados.update((actual) => {
      if (actual === null) {
        return null;
      }

      return {
        ...actual,
        viajes: actual.viajes.map((viaje) =>
          viaje.id === id ? { ...viaje, activo: !viaje.activo } : viaje,
        ),
      };
    });
  }

  desactivarViaje(id: number): void {
    this.confirmarCambioEstado(`¿Desea desactivar el viaje seleccionado?`, '#a6001c', () => {
      this.viajesService.desactivarViaje(id).subscribe(
        {
          next: () => {
            this.toggleActivo(id);
            toast.info("Viaje desactivado");
          }
        }
      );
    })
  }

  activarViaje(id: number): void {
    this.confirmarCambioEstado(`¿Desea activar el viaje seleccionado?`, '#2f6b45', () => {
      this.viajesService.activarViaje(id).subscribe(
        {
          next: () => {
            this.toggleActivo(id);
            toast.info("Viaje activado");
          }
        }
      );
    })
  }

}
