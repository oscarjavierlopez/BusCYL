import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { Observable } from 'rxjs';
import { Conductor } from '../models/conductor';

@Injectable({
  providedIn: 'root',
})
export class ConductoresService {
  private httpClient = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/conductores`;

  obtenerConductores(): Observable<Conductor[]> {
    return this.httpClient.get<Conductor[]>(this.baseUrl);
  }
}
