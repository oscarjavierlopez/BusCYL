import { Component, inject } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';

@Component({
  selector: 'app-registro',
  imports: [ReactiveFormsModule],
  templateUrl: './registro.html',
  styleUrl: './registro.css',
})
export class Registro {
  private formBuilder = inject(FormBuilder);

  private contrasenasCoinciden = (control: AbstractControl): ValidationErrors | null => {
    const contrasena = control.get('contrasena')?.value;
    const repetirContrasena = control.get('repetirContrasena')?.value;

    return contrasena === repetirContrasena ? null : { contrasenasNoCoinciden: true };
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
      fechaNacimiento: ['', [Validators.required]],
      fechaRegistro: ['', [Validators.required]],
    },
    { validators: this.contrasenasCoinciden },
  );

  submit(): void {}
}
