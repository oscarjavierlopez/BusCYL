import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Empresa } from '../models/empresa';

@Injectable({
  providedIn: 'root',
})
export class EmpresasService {
  private httpClient = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/empresas`;

  obtenerEmpresas(): Observable<Empresa[]> {
    return this.httpClient.get<Empresa[]>(this.baseUrl);
  }

  obtenerEmpresa(id: number): Observable<Empresa> {
    return this.httpClient.get<Empresa>(`${this.baseUrl}/${id}`);
  }

  crearEmpresa(empresa: Empresa): Observable<Empresa> {
    return this.httpClient.post<Empresa>(this.baseUrl, empresa);
  }

  actualizarEmpresa(id: number, empresa: Partial<Empresa>): Observable<Empresa> {
    return this.httpClient.patch<Empresa>(`${this.baseUrl}/${id}`, empresa);
  }

  desactivarEmpresa(id: number): Observable<void> {
    return this.httpClient.patch<void>(`${this.baseUrl}/${id}/desactivar`, null);
  }

  activarEmpresa(id: number): Observable<void> {
    return this.httpClient.patch<void>(`${this.baseUrl}/${id}/activar`, null);
  }
}
