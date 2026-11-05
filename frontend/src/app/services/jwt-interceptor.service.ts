import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { throwError } from 'rxjs';

export const jwtInterceptor: HttpInterceptorFn = (request, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const usuario = authService.currentUserData.value;
  const esRutaPublica = request.url.includes('/auth/login')
    || request.url.includes('/auth/register')
    || request.url.includes('/auth/forgot-password')
    || request.url.includes('/auth/reset-password');

  if (!usuario?.token) {
    return next(request);
  }

  if (usuario.exp === null || usuario.exp <= Date.now()) {
    authService.logout();
    void router.navigate(['/inicio-sesion'], {
      state: { sesionExpirada: true },
    });

    if (esRutaPublica) {
      return next(request);
    }

    return throwError(() => new HttpErrorResponse({
      error: { error: 'La sesión ha caducado.' },
      status: 401,
      statusText: 'Token expirado',
      url: request.url,
    }));
  }

  if (esRutaPublica) {
    return next(request);
  }

  return next(
    request.clone({
      setHeaders: {
        Authorization: `Bearer ${usuario.token}`,
      },
    }),
  );
};
