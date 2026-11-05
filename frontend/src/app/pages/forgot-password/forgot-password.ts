import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { toast, NgxSonnerToaster } from 'ngx-sonner';
import { obtenerMensajeErrorAutenticacion } from '../../utils/auth-error-message';
import { resetearErroresAlModificarFormulario } from '../../utils/form-error-reset';

@Component({
  selector: 'app-forgot-password',
  imports: [ReactiveFormsModule, NgxSonnerToaster],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css',
})
export class ForgotPassword implements OnInit {
  private formBuilder = inject(FormBuilder);
  private authService = inject(AuthService);
  private destroyRef = inject(DestroyRef);

  forgotPasswordForm = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  mensajeError = signal<string | null>(null);

  ngOnInit(): void {
    resetearErroresAlModificarFormulario(this.forgotPasswordForm, this.mensajeError, this.destroyRef);
  }

  submit(): void {
    if (this.forgotPasswordForm.valid) {
      const email = this.forgotPasswordForm.value.email!;

      this.mensajeError.set(null);

      this.authService.forgotPassword({email: email}).subscribe({
        next: () => {
          toast.success(`Le hemos enviado un correo a ${email}`);
        },
        error: (err: HttpErrorResponse) => {
          this.mensajeError.set(obtenerMensajeErrorAutenticacion(err, 'No se ha podido enviar el correo.'));
        },
      });
    } else {
      this.forgotPasswordForm.markAllAsTouched();
    }
  }
}
