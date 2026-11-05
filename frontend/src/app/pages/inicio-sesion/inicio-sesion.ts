import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { LoginRequest } from '../../models/login-request';
import { Router, RouterLink } from '@angular/router';
import { toast, NgxSonnerToaster } from 'ngx-sonner';
import { obtenerMensajeErrorAutenticacion } from '../../utils/auth-error-message';
import { resetearErroresAlModificarFormulario } from '../../utils/form-error-reset';

@Component({
  selector: 'app-inicio-sesion',
  imports: [ReactiveFormsModule, RouterLink, NgxSonnerToaster],
  templateUrl: './inicio-sesion.html',
  styleUrl: './inicio-sesion.css',
})
export class InicioSesion implements OnInit {
  private formBuilder = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  intentos: number = 0;
  mostrarContrasena: boolean = false;
  mensajeError = signal<string | null>(null);

  inicioSesionForm = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
    contrasena: ['', [Validators.required, Validators.maxLength(255)]],
  });

  ngOnInit(): void {
    resetearErroresAlModificarFormulario(this.inicioSesionForm, this.mensajeError, this.destroyRef);

    const { sesionExpirada, ...estadoRestante } = history.state;

    if (sesionExpirada) {
      toast.error('Su sesión ha expirado. Inicie sesión de nuevo.');
      history.replaceState(estadoRestante, '', location.href);
    }
  }

  submit(): void {
    this.mensajeError.set(null);

    if (this.inicioSesionForm.valid) {
      let loginRequest: LoginRequest = {
        email: this.inicioSesionForm.value.email!,
        contrasena: this.inicioSesionForm.value.contrasena!
      }
      this.authService.login(loginRequest)
        .subscribe({
          next: (authResponse) => {
            toast.success(`Ha iniciado sesión como ${authResponse.email}`);
            setTimeout(() => {
              this.router.navigate(["/private"]);
            }, 3000);
          },
          error: (err: HttpErrorResponse) => {
            this.mensajeError.set(err.status === 401 ? 'usuario o contraseña incorrectos' : obtenerMensajeErrorAutenticacion(err, 'No se ha podido iniciar sesión.'));
          }
        });
    }
    else {
      this.inicioSesionForm.markAllAsTouched();
    }
  }

  alternarVisibilidadContrasena(): void {
    this.mostrarContrasena = !this.mostrarContrasena;
  }
}
