import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { RegistroRequest } from '../models/registro-request';
import { AuthResponse } from '../models/auth-response';
import { LoginRequest } from '../models/login-request';
import { ResetPasswordRequest } from '../models/reset-password-request';
import { ForgotPasswordRequest } from '../models/forgot-password-request';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private httpClient = inject(HttpClient);
  private baseUrl = "/auth";

  currentUserLoginOn: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  currentUserData: BehaviorSubject<AuthResponse | null> = new BehaviorSubject<AuthResponse | null>(null);

  private obtenerHeaders() {
    return new HttpHeaders({
      'Content-Type': 'application/json'
    });
  }

  register(data: RegistroRequest): Observable<AuthResponse> {
    return this.httpClient.post<AuthResponse>(`${environment.apiUrl}${this.baseUrl}/register`, data, { headers: this.obtenerHeaders() })
      .pipe(
        tap((data) => {
          localStorage.setItem('usuario', JSON.stringify(data));
          this.currentUserData.next(data);
          this.currentUserLoginOn.next(true)
        }),
      );
  }

  login(data: LoginRequest): Observable<AuthResponse> {
    return this.httpClient.post<AuthResponse>(`${environment.apiUrl}${this.baseUrl}/login`, data, { headers: this.obtenerHeaders() })
      .pipe(
        tap((data) => {
          localStorage.setItem('usuario', JSON.stringify(data));
          this.currentUserData.next(data);
          this.currentUserLoginOn.next(true)
        }),
      );
  }

  forgotPassword(data: ForgotPasswordRequest): Observable<String> {
    return this.httpClient.post<string>(`${environment.apiUrl}${this.baseUrl}/forgot-password`, data, { headers: this.obtenerHeaders() });
  }

  resetPassword(data: ResetPasswordRequest): Observable<void> {
    return this.httpClient.post<void>(`${environment.apiUrl}${this.baseUrl}/reset-password`, data, { headers: this.obtenerHeaders() });
  }


  logout(): void {
    localStorage.clear();
    this.currentUserLoginOn.next(false);
  }

  get UserData(): Observable<AuthResponse | null> {
    return this.currentUserData.asObservable();
  }

  get token(): String | null {
    return this.currentUserData.value?.token ?? null;
  }

  get userLoginOn(): Observable<boolean> {
    return this.currentUserLoginOn.asObservable();
  }
}
