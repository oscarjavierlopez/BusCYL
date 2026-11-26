import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Asiento } from '../models/asiento';
import { Viaje } from '../models/viaje';
import { ViajesPaginados } from '../models/viajes-paginados';

@Injectable({
  providedIn: 'root',
})
export class ViajesService {
  private httpClient = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/viajes`;

  obtenerViajes(
    pagina: number,
    idOrigen: number,
    idDestino: number,
    fecha: string,
  ): Observable<ViajesPaginados> {
    const params = new HttpParams()
      .set('pagina', pagina)
      .set('idOrigen', idOrigen)
      .set('idDestino', idDestino)
      .set('fecha', fecha);

    return this.httpClient.get<ViajesPaginados>(this.baseUrl, { params });
  }

  obtenerViaje(id: number): Observable<Viaje> {
    return this.httpClient.get<Viaje>(`${this.baseUrl}/${id}`);
  }

  obtenerViajesUsuario(): Observable<Viaje[]> {
    return this.httpClient.get<Viaje[]>(`${this.baseUrl}/me`);
  }

  obtenerViajeUsuario(id: number): Observable<Viaje> {
    return this.httpClient.get<Viaje>(`${this.baseUrl}/me/${id}`);
  }

  obtenerAsientosViaje(
    id: number,
    idParadaOrigen: number,
    idParadaDestino: number,
  ): Observable<Asiento[]> {
    const params = new HttpParams()
      .set('idParadaOrigen', idParadaOrigen)
      .set('idParadaDestino', idParadaDestino);

    return this.httpClient.get<Asiento[]>(`${this.baseUrl}/${id}/asientos`, { params });
  }

  crearViaje(viaje: Viaje): Observable<Viaje[]> {
    return this.httpClient.post<Viaje[]>(this.baseUrl, viaje);
  }

  actualizarViaje(id: number, viaje: Viaje): Observable<Viaje> {
    return this.httpClient.patch<Viaje>(`${this.baseUrl}/${id}`, viaje);
  }

  desactivarViaje(id: number): Observable<void> {
    return this.httpClient.patch<void>(`${this.baseUrl}/${id}/desactivar`, null);
  }

  activarViaje(id: number): Observable<void> {
    return this.httpClient.patch<void>(`${this.baseUrl}/${id}/activar`, null);
  }
}
