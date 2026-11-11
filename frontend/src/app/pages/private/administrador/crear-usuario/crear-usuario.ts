import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { UsuariosService } from '../../../../services/usuarios.service';
import { email } from '@angular/forms/signals';
import { Usuario } from '../../../../models/usuario';
import { Empresa } from '../../../../models/empresa';
import { Rol } from '../../../../models/rol';
import { EmpresasService } from '../../../../services/empresas.service';
import { RolesService } from '../../../../services/roles.service';
import { Router, RouterLink } from '@angular/router';
import {toast, NgxSonnerToaster } from 'ngx-sonner';
import { obtenerMensajeErrorAutenticacion } from '../../../../utils/auth-error-message';
import { resetearErroresAlModificarFormulario } from '../../../../utils/form-error-reset';
import { normalizarTextoBusqueda } from '../../../../utils/text-search-normalizer';


@Component({
  selector: 'app-crear-usuario',
  imports: [ReactiveFormsModule, RouterLink, NgxSonnerToaster],
  templateUrl: './crear-usuario.html',
  styleUrl: './crear-usuario.css',
})
export class CrearUsuario implements OnInit {
  private formBuilder = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);
  private usuariosService = inject(UsuariosService);
  private empresasService = inject(EmpresasService);
  private rolesService = inject(RolesService);

  empresas = signal<Empresa[]>([]);
  empresasFiltradas = signal<Empresa[]>([]);
  busquedaEmpresa = signal<string>('');
  mostrarSugerenciasEmpresa = signal<boolean>(false);
  roles = signal<Rol[]>([]);
  mensajeError = signal<string | null>(null);

  ngOnInit(): void {
    resetearErroresAlModificarFormulario(this.crearUsuarioForm, this.mensajeError, this.destroyRef);

    this.empresasService.obtenerEmpresas()
      .subscribe({
        next: (empresas) => {
          this.empresas.set(empresas);
          this.actualizarEmpresasFiltradas(this.busquedaEmpresa());
        },
        error: (error) => {
          console.error('Ocurrió un error:', error);
        }
      });

    this.rolesService.obtenerRoles()
      .subscribe({
        next: (roles) => {
          this.roles.set(roles);
        },
        error: (error) => {
          console.error('Ocurrió un error:', error);
        }
      });
  }

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

  private empresaObligatoriaSegunRol = (control: AbstractControl): ValidationErrors | null => {
    const rol = control.get('rol')?.value;
    const empresa = control.get('empresa')?.value;
    const requiereEmpresa = rol === 2 || rol === 3;
    const empresaNoSeleccionada = empresa === null || empresa === undefined || empresa === '';

    return requiereEmpresa && empresaNoSeleccionada ? { empresaObligatoria: true } : null;
  };

  manejarBusquedaEmpresa(event: Event): void {
    const textoBusqueda = (event.target as HTMLInputElement).value;

    this.busquedaEmpresa.set(textoBusqueda);
    this.crearUsuarioForm.controls.empresa.setValue('');
    this.mostrarSugerenciasEmpresa.set(textoBusqueda.length > 0);
    this.actualizarEmpresasFiltradas(textoBusqueda);
  }

  seleccionarEmpresa(empresa: Empresa): void {
    this.crearUsuarioForm.controls.empresa.setValue(empresa.id!);
    this.busquedaEmpresa.set(empresa.nombre);
    this.empresasFiltradas.set([]);
    this.mostrarSugerenciasEmpresa.set(false);
  }

  private actualizarEmpresasFiltradas(textoBusqueda: string): void {
    const textoNormalizado = normalizarTextoBusqueda(textoBusqueda);

    this.empresasFiltradas.set(
      textoNormalizado.length === 0
        ? []
        : this.empresas().filter((empresa) =>
          empresa.activo && empresa.id !== undefined && normalizarTextoBusqueda(empresa.nombre).includes(textoNormalizado),
        ),
    );
  }

  crearUsuarioForm = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    rol: ['', [Validators.required]],
    dni: ['', [Validators.required, Validators.pattern(/^\d{8}[a-zA-Z]$/)]],
    nombre: ['', [Validators.required, this.noSoloEspacios]],
    apellidos: ['', [Validators.required, this.noSoloEspacios]],
    telefono: ['', [Validators.required, Validators.pattern(/^\d{9}$/)]],
    fechaNacimiento: ['', [Validators.required, this.fechaNacimientoPasada]],
    empresa: this.formBuilder.nonNullable.control<number | ''>(''),
  }, { validators: this.empresaObligatoriaSegunRol });

  submit(): void {
    this.mensajeError.set(null);

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

      if (this.crearUsuarioForm.value.empresa! != '') {
        nuevoUsuario = { ...nuevoUsuario, empresa: this.crearUsuarioForm.value.empresa! };
      }

      this.usuariosService.crearUsuario(nuevoUsuario)
        .subscribe({
          next: (respuesta) => {
            toast.success("Usuario añadido correctamente");
            setTimeout(() => {
              this.router.navigate(["/private/usuarios"]);
            }, 1000);
          },
          error: (error: HttpErrorResponse) => {
            this.mensajeError.set(obtenerMensajeErrorAutenticacion(error, 'No se ha podido crear el usuario.'));
          }
        });
    }
    else {
      this.crearUsuarioForm.markAllAsTouched();
    }
  }
}
