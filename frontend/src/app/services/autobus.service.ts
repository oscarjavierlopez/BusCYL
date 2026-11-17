import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Autobus } from '../models/autobus';
import { AutobusesPaginados } from '../models/autobuses-paginados';

@Injectable({
  providedIn: 'root',
})
export class AutobusService {
  private httpClient = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/autobuses`;

  obtenerAutobuses(): Observable<Autobus[]> {
    return this.httpClient.get<Autobus[]>(this.baseUrl);
  }

  obtenerAutobusesPaginados(pagina: number, matricula: string): Observable<AutobusesPaginados> {
    const params = new HttpParams()
      .set('pagina', pagina)
      .set('matricula', matricula);

    return this.httpClient.get<AutobusesPaginados>(this.baseUrl, { params });
  }

  obtenerAutobus(id: number): Observable<Autobus> {
    return this.httpClient.get<Autobus>(`${this.baseUrl}/${id}`);
  }

  crearAutobus(autobus: Autobus): Observable<Autobus> {
    return this.httpClient.post<Autobus>(this.baseUrl, autobus);
  }

  actualizarAutobus(id: number, autobus: Partial<Autobus>): Observable<Autobus> {
    return this.httpClient.patch<Autobus>(`${this.baseUrl}/${id}`, autobus);
  }

  desactivarAutobus(id: number): Observable<void> {
    return this.httpClient.patch<void>(`${this.baseUrl}/${id}/desactivar`, null);
  }

  activarAutobus(id: number): Observable<void> {
    return this.httpClient.patch<void>(`${this.baseUrl}/${id}/activar`, null);
  }
}
