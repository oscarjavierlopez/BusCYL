import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { ForgotPasswordRequest } from '../models/forgot-password-request';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class InvitacionesService {
  private httpClient = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/invitaciones`;

  enviarInvitacion(data: ForgotPasswordRequest): Observable<String>{
    return this.httpClient.post<string>(`${this.baseUrl}`, data);
  }
}
