import { Component, inject, OnInit, signal } from '@angular/core';
import { ViajesService } from '../../../../services/viajes.service';
import { LocalidadesService } from '../../../../services/localidades.service';
import { Localidad } from '../../../../models/localidad';
import { ViajeCard } from '../../../../components/viaje-card/viaje-card';
import { ViajesPaginados } from '../../../../models/viajes-paginados';

@Component({
  selector: 'app-viajes-coordinador',
  imports: [ViajeCard],
  templateUrl: './viajes-coordinador.html',
  styleUrl: './viajes-coordinador.css',
})
export class ViajesCoordinador implements OnInit {
  private viajesService = inject(ViajesService);
  private localidadesService = inject(LocalidadesService);

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
        },
        error: (error) => {
          console.error('Ocurrió un error:', error);
        }
      });
  }

  changeOrigen(id: number): void {
    this.limpiarErrores();
    this.origen.set(id);
    this.busquedaOrigen.set(this.localidades().find((localidad) => localidad.id === id)?.nombre ?? '');
    this.localidadesOrigenFiltradas.set([]);
    this.mostrarSugerenciasOrigen.set(false);
  }

  changeDestino(id: number): void {
    this.limpiarErrores();
    this.destino.set(id);
    this.busquedaDestino.set(this.localidades().find((localidad) => localidad.id === id)?.nombre ?? '');
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
    this.obtenerViajes();
  }

  cambiarPagina(pagina: number): void {
    this.pagina.set(pagina);
    this.obtenerViajes();
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

  private limpiarErrores(): void {
    this.errorOrigen.set(false);
    this.errorDestino.set(false);
    this.errorFecha.set(false);
  }
}
