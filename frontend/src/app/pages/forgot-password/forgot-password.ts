import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  imports: [ReactiveFormsModule],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css',
})
export class ForgotPassword {
  private formBuilder = inject(FormBuilder);
  private authService = inject(AuthService);

  forgotPasswordForm = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  mensajeExito = signal<string | null>(null);
  mensajeError = signal<string | null>(null);

  submit(): void {
    if (this.forgotPasswordForm.valid) {
      const email = this.forgotPasswordForm.value.email!;

      this.mensajeExito.set(null);
      this.mensajeError.set(null);

      this.authService.forgotPassword({email: email}).subscribe({
        next: () => {
          this.mensajeExito.set(`Le hemos enviado un correo a ${email}`);
        },
        error: (err: HttpErrorResponse) => {
          this.mensajeError.set(typeof err.error?.error === 'string' ? err.error.error : 'No se ha podido enviar el correo.');
        },
      });
    } else {
      this.forgotPasswordForm.markAllAsTouched();
    }
  }
}
