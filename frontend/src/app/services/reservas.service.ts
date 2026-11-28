import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Reserva } from '../models/reserva';

@Injectable({
  providedIn: 'root',
})
export class ReservasService {
  private httpClient = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/reservas`;

  crearReserva(reserva: Reserva): Observable<Reserva> {
    return this.httpClient.post<Reserva>(this.baseUrl, reserva);
  }

  cancelarReserva(id: number): Observable<void> {
    return this.httpClient.patch<void>(`${this.baseUrl}/${id}/cancelar`, null);
  }
}
