import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { Observable } from 'rxjs';
import { Localidad } from '../models/localidad';

@Injectable({
  providedIn: 'root',
})
export class LocalidadesService {
  private httpClient = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/localidades`;

  obtenerLocalidades(): Observable<Localidad[]>{
    return this.httpClient.get<Localidad[]>(this.baseUrl);
  }
}
