import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Usuario } from '../models/usuario';
import { UsuariosPaginados } from '../models/usuarios-paginados';

@Injectable({
  providedIn: 'root',
})
export class UsuariosService {
  private httpClient = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/usuarios`;

  obtenerUsuarios(pagina: number, nombreApellidos: string, activo: boolean): Observable<UsuariosPaginados> {
    const params = new HttpParams()
      .set('pagina', pagina)
      .set('nombreApellidos', nombreApellidos)
      .set('activo', activo);

    return this.httpClient.get<UsuariosPaginados>(this.baseUrl, { params });
  }

  obtenerUsuario(id: number): Observable<Usuario> {
    return this.httpClient.get<Usuario>(`${this.baseUrl}/${id}`);
  }

  crearUsuario(usuario: Omit<Usuario, 'id' | 'activo'>): Observable<Usuario> {
    return this.httpClient.post<Usuario>(this.baseUrl, usuario);
  }

  actualizarUsuario(id: number, usuario: Partial<Omit<Usuario, 'id' | 'activo'>>): Observable<Usuario> {
    return this.httpClient.patch<Usuario>(`${this.baseUrl}/${id}`, usuario);
  }

  desactivarUsuario(id: number): Observable<void> {
    return this.httpClient.patch<void>(`${this.baseUrl}/${id}/desactivar`, null);
  }

  activarUsuario(id: number): Observable<void> {
    return this.httpClient.patch<void>(`${this.baseUrl}/${id}/activar`, null);
  }
}
