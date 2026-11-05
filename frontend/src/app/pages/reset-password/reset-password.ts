import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ResetPasswordRequest } from '../../models/reset-password-request';
import { ActivatedRoute, Router } from '@angular/router';
import { toast, NgxSonnerToaster } from 'ngx-sonner';

@Component({
  selector: 'app-reset-password',
  imports: [ReactiveFormsModule, NgxSonnerToaster],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css',
})
export class ResetPassword implements OnInit {
  private formBuilder = inject(FormBuilder);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  protected readonly toast = toast;

  private token = '';

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
    })
  };

  private contrasenasCoinciden = (control: AbstractControl): ValidationErrors | null => {
    const contrasena = control.get('contrasena')?.value;
    const repetirContrasena = control.get('repetirContrasena')?.value;

    return contrasena === repetirContrasena ? null : { contrasenasNoCoinciden: true };
  };

  resetPasswordForm = this.formBuilder.nonNullable.group(
    {
      contrasena: [
        '',
        [
          Validators.required,
          Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=(?:.*\d){2})(?=(?:.*[^A-Za-z0-9\s]){2}).{8,}$/),
        ],
      ],
      repetirContrasena: [
        '',
        [
          Validators.required,
          Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=(?:.*\d){2})(?=(?:.*[^A-Za-z0-9\s]){2}).{8,}$/),
        ],
      ],
    },
    { validators: this.contrasenasCoinciden },
  );

  mensajeError = signal<string | null>(null);
  mostrarContrasena = signal<boolean>(false);
  mostrarRepetirContrasena = signal<boolean>(false);

  submit(): void {
    if (this.resetPasswordForm.valid) {
      const resetPasswordRequest: ResetPasswordRequest = {
        token: this.token,
        contrasena: this.resetPasswordForm.value.contrasena!,
      };

      this.mensajeError.set(null);

      this.authService.resetPassword(resetPasswordRequest).subscribe({
        next: (response) => {
          if (response.status === 204) {
            toast.success('La contraseña ha sido reestablecida');
            setTimeout(() => {
              this.router.navigate(['/inicio-sesion']);
            }, 3000);
          }
        },
        error: (err: HttpErrorResponse) => {
          this.mensajeError.set(typeof err.error?.error === 'string' ? err.error.error : 'No se ha podido cambiar la contraseña. Inténtelo de nuevo tras 15 minutos.');
        },
      });
    } else {
      this.resetPasswordForm.markAllAsTouched();
    }
  }

  alternarVisibilidadContrasena(campo: 'contrasena' | 'repetirContrasena'): void {
    if (campo === 'contrasena') {
      this.mostrarContrasena.update((visible) => !visible);
      return;
    }

    this.mostrarRepetirContrasena.update((visible) => !visible);
  }
}
