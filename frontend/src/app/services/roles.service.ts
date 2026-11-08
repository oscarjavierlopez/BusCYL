import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { Observable } from 'rxjs';
import { Rol } from '../models/rol';

@Injectable({
  providedIn: 'root',
})
export class RolesService {
  private httpClient = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/roles`;


  obtenerRoles(): Observable<Rol[]>{
    return this.httpClient.get<Rol[]>(this.baseUrl);
  }
}
