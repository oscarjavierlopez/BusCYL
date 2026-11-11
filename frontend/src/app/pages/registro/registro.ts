import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { RegistroRequest } from '../../models/registro-request';
import { Router, RouterLink } from '@angular/router';
import { toast, NgxSonnerToaster } from 'ngx-sonner';
import { obtenerMensajeErrorAutenticacion } from '../../utils/auth-error-message';
import { resetearErroresAlModificarFormulario } from '../../utils/form-error-reset';

@Component({
  selector: 'app-registro',
  imports: [ReactiveFormsModule, RouterLink, NgxSonnerToaster],
  templateUrl: './registro.html',
  styleUrl: './registro.css',
})
export class Registro implements OnInit {
  private formBuilder = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  mostrarContrasena: boolean = false;
  mostrarRepetirContrasena: boolean = false;
  mensajeError = signal<string | null>(null);

  private contrasenasCoinciden = (control: AbstractControl): ValidationErrors | null => {
    const contrasena = control.get('contrasena')?.value;
    const repetirContrasena = control.get('repetirContrasena')?.value;

    return contrasena === repetirContrasena ? null : { contrasenasNoCoinciden: true };
  };

  private fechaNacimientoPasada = (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    const fechaNacimiento = new Date(`${control.value}T00:00:00`);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    return fechaNacimiento < hoy ? null : { fechaNoPasada: true };
  };

  registroForm = this.formBuilder.nonNullable.group(
    {
      email: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      apellidos: ['', [Validators.required, Validators.maxLength(150)]],
      dni: ['', [Validators.required, Validators.maxLength(9), Validators.pattern(/^\d{8}[a-zA-Z]$/)]],
      telefono: ['', [Validators.required, Validators.maxLength(15), Validators.pattern(/^\d{9}$/)]],
      contrasena: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(255),
          Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=(?:.*\d){2})(?=(?:.*[^A-Za-z0-9\s]){2}).{8,}$/),
        ],
      ],
      repetirContrasena: ['', [Validators.required]],
      fechaNacimiento: ['', [Validators.required, this.fechaNacimientoPasada]],
    },
    { validators: this.contrasenasCoinciden },
  );

  ngOnInit(): void {
    resetearErroresAlModificarFormulario(this.registroForm, this.mensajeError, this.destroyRef);
  }

  submit(): void {
    this.mensajeError.set(null);

    if (this.registroForm.valid) {
      let registroRequest: RegistroRequest = {
        email: this.registroForm.value.email!,
        dni: this.registroForm.value.dni!,
        nombre: this.registroForm.value.nombre!,
        apellidos: this.registroForm.value.apellidos!,
        telefono: this.registroForm.value.telefono!,
        fechaNacimiento: this.registroForm.value.fechaNacimiento!,
        contrasena: this.registroForm.value.contrasena!
      }
      this.authService.register(registroRequest)
        .subscribe({
          next: (authResponse) => {
            let paginaInicio = "";
            switch (authResponse.rol) {
              case "administrador":
                paginaInicio = "/private/usuarios"
                break;
            
              default:
                paginaInicio = "/private"
                break;
            }

            toast.success(`Ha iniciado sesión como ${authResponse.email}`);
            setTimeout(() => {
              this.router.navigate([paginaInicio]);
            }, 1000);
          },
          error: (err: HttpErrorResponse) => {
            this.mensajeError.set(err.status === 409 ? 'Ya existe un usuario con esos credenciales pruebe a iniciar sesión' : obtenerMensajeErrorAutenticacion(err, 'No se ha podido completar el registro.'));
          }
        });
    }
    else {
      this.registroForm.markAllAsTouched();
    }
  }

  alternarVisibilidadContrasena(campo: 'contrasena' | 'repetirContrasena'): void {
    if (campo === 'contrasena') {
      this.mostrarContrasena = !this.mostrarContrasena;
      return;
    }

    this.mostrarRepetirContrasena = !this.mostrarRepetirContrasena;
  }
}
