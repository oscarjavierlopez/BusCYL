import { Component, inject } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { UsuariosService } from '../../../../services/usuarios.service';
import { email } from '@angular/forms/signals';
import { Usuario } from '../../../../models/usuario';


@Component({
  selector: 'app-crear-usuario',
  imports: [ReactiveFormsModule],
  templateUrl: './crear-usuario.html',
  styleUrl: './crear-usuario.css',
})
export class CrearUsuario {
  private formBuilder = inject(FormBuilder);
  private usuariosService = inject(UsuariosService);

  private noSoloEspacios = (control: AbstractControl): ValidationErrors | null => {
    if (typeof control.value === 'string' && control.value.length > 0 && control.value.trim().length === 0) {
      return { soloEspacios: true };
    }

    return null;
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

  crearUsuarioForm = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    rol: ['', [Validators.required]],
    dni: ['', [Validators.required, Validators.pattern(/^\d{8}[a-zA-Z]$/)]],
    nombre: ['', [Validators.required, this.noSoloEspacios]],
    apellidos: ['', [Validators.required, this.noSoloEspacios]],
    telefono: ['', [Validators.required, Validators.pattern(/^\d{9}$/)]],
    fechaNacimiento: ['', [Validators.required, this.fechaNacimientoPasada]],
    empresa: ['', [Validators.pattern(/^-?\d+$/)]],
  });

  submit(): void {
    if (this.crearUsuarioForm.valid) {
      let nuevoUsuario: Usuario = {
        email: this.crearUsuarioForm.value.email!,
        rol: this.crearUsuarioForm.value.rol!,
        dni: this.crearUsuarioForm.value.dni!,
        nombre: this.crearUsuarioForm.value.nombre!,
        apellidos: this.crearUsuarioForm.value.apellidos!,
        telefono: this.crearUsuarioForm.value.telefono!,
        fechaNacimiento: this.crearUsuarioForm.value.fechaNacimiento!
      }

      if (this.crearUsuarioForm.value.empresa! != null) {
        nuevoUsuario = { ...nuevoUsuario, empresa: this.crearUsuarioForm.value.empresa! };
      }

      this.usuariosService.crearUsuario(nuevoUsuario)
        .subscribe({
          next: (respuesta) => {
            
          },
          error: (error) => {
            console.error('Ocurrió un error:', error);
          }
        });
    }
    else {
      this.crearUsuarioForm.markAllAsTouched();
    }
  }
}
