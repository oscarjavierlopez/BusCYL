import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { LoginRequest } from '../../models/login-request';
import { Router } from '@angular/router';

@Component({
  selector: 'app-inicio-sesion',
  imports: [ReactiveFormsModule],
  templateUrl: './inicio-sesion.html',
  styleUrl: './inicio-sesion.css',
})
export class InicioSesion implements OnInit {
  private formBuilder = inject(FormBuilder);
  private authService = inject(AuthService);
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);

  intentos: number = 0;
  mostrarContrasena: boolean = false;
  mostrarErrorLogin = signal<boolean>(false);

  inicioSesionForm = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
    contrasena: ['', [Validators.required, Validators.maxLength(255)]],
  });

  ngOnInit(): void {
    this.inicioSesionForm.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.mostrarErrorLogin.set(false);
      });
  }

  submit(): void {
    if (this.inicioSesionForm.valid) {
      let loginRequest: LoginRequest = {
        email: this.inicioSesionForm.value.email!,
        contrasena: this.inicioSesionForm.value.contrasena!
      }
      this.authService.login(loginRequest)
        .subscribe({
          next: (authResponse) => {
            this.router.navigate(["/private"]);
          },
          error: (err) => {
            this.mostrarErrorLogin.set(true);
          }
        });
    }
    else{
      this.inicioSesionForm.markAllAsTouched();
    }
  }

  alternarVisibilidadContrasena(): void {
    this.mostrarContrasena = !this.mostrarContrasena;
  }
}
