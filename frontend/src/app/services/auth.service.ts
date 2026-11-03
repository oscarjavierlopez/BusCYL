import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { RegistroRequest } from '../models/registro-request';
import { AuthResponse } from '../models/auth-response';
import { LoginRequest } from '../models/login-request';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private httpClient = inject(HttpClient);
  private baseUrl = "/auth";

  currentUserLoginOn: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  currentUserData: BehaviorSubject<AuthResponse | null> = new BehaviorSubject<AuthResponse | null>(null);

  register(data: RegistroRequest): Observable<AuthResponse> {
    return this.httpClient.post<AuthResponse>(`${environment.apiUrl}${this.baseUrl}/register`, data)
      .pipe(
        tap((data) => {
          localStorage.setItem('usuario', JSON.stringify(data));
          this.currentUserData.next(data);
          this.currentUserLoginOn.next(true)
        }),
      );
  }

  login(data: LoginRequest): Observable<AuthResponse> {
    return this.httpClient.post<AuthResponse>(`${environment.apiUrl}${this.baseUrl}/login`, data)
      .pipe(
        tap((data) => {
          localStorage.setItem('usuario', JSON.stringify(data));
          this.currentUserData.next(data);
          this.currentUserLoginOn.next(true)
        }),
      );
  }

  logout(): void {
    localStorage.clear();
    this.currentUserLoginOn.next(false);
  }

  get UserData(): Observable<AuthResponse | null> {
    return this.currentUserData.asObservable();
  }

  get token(): String | null{
    return this.currentUserData.value?.token ?? null;
  }

  get userLoginOn(): Observable<boolean> {
    return this.currentUserLoginOn.asObservable();
  }
}
