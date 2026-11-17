import { Component, inject, OnInit, signal } from '@angular/core';
import { ViajesService } from '../../../../services/viajes.service';
import { LocalidadesService } from '../../../../services/localidades.service';
import { Localidad } from '../../../../models/localidad';
import { ViajeCard } from '../../../../components/viaje-card/viaje-card';
import { ViajesPaginados } from '../../../../models/viajes-paginados';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-viajes-coordinador',
  imports: [ViajeCard],
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
  fechaVisible = signal<string>('');
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
    const textoFecha = (event.target as HTMLInputElement).value.trim();

    this.limpiarErrores();
    this.fechaVisible.set(textoFecha);
    this.fecha.set(this.convertirFechaAISO(textoFecha));
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
    this.fechaVisible.set('');
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

  private convertirFechaAISO(textoFecha: string): string | null {
    const coincidencias = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(textoFecha);

    if (!coincidencias) {
      return null;
    }

    const dia = Number(coincidencias[1]);
    const mes = Number(coincidencias[2]);
    const anio = Number(coincidencias[3]);
    const fecha = new Date(anio, mes - 1, dia);

    if (fecha.getFullYear() !== anio || fecha.getMonth() !== mes - 1 || fecha.getDate() !== dia) {
      return null;
    }

    return `${anio}-${coincidencias[2]}-${coincidencias[1]}`;
  }

  private formatearFechaVisible(fechaISO: string): string {
    const coincidencias = /^(\d{4})-(\d{2})-(\d{2})$/.exec(fechaISO);

    return coincidencias ? `${coincidencias[3]}/${coincidencias[2]}/${coincidencias[1]}` : '';
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

  private leerQueryParams(): void{
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
        this.fechaVisible.set(this.formatearFechaVisible(fecha));
      }
    });
  }
}
