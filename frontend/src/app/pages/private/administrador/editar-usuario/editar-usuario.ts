import { Component, DestroyRef, inject, Input, OnInit, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { toast, NgxSonnerToaster } from 'ngx-sonner';
import { UsuariosService } from '../../../../services/usuarios.service';
import { EmpresasService } from '../../../../services/empresas.service';
import { RolesService } from '../../../../services/roles.service';
import { Empresa } from '../../../../models/empresa';
import { resetearErroresAlModificarFormulario } from '../../../../utils/form-error-reset';
import { Rol } from '../../../../models/rol';
import { Usuario } from '../../../../models/usuario';
import { HttpErrorResponse } from '@angular/common/http';
import { obtenerMensajeErrorAutenticacion } from '../../../../utils/auth-error-message';
import { normalizarTextoBusqueda } from '../../../../utils/text-search-normalizer';

@Component({
  selector: 'app-editar-usuario',
  imports: [ReactiveFormsModule, RouterLink, NgxSonnerToaster],
  templateUrl: './editar-usuario.html',
  styleUrl: './editar-usuario.css',
})
export class EditarUsuario implements OnInit {
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
  usuario!: Usuario;

  @Input() id!: string;

  ngOnInit(): void {
    resetearErroresAlModificarFormulario(this.editarUsuarioForm, this.mensajeError, this.destroyRef);

    this.usuariosService.obtenerUsuario(Number(this.id)).subscribe(
      {
        next: (usuario: Usuario) => {
          this.usuario = usuario;

          this.editarUsuarioForm.patchValue({
            email: usuario.email,
            dni: usuario.dni,
            nombre: usuario.nombre,
            apellidos: usuario.apellidos,
            telefono: usuario.telefono,
            fechaNacimiento: usuario.fechaNacimiento,
            empresa: '',
          });

          this.rolesService.obtenerRoles()
            .subscribe({
              next: (roles) => {
                this.roles.set(roles);

                this.editarUsuarioForm.patchValue({
                  rol: this.obtenerRol(this.usuario.rol.toString()),
                });
              },
              error: (error) => {
                console.error('Ocurrió un error:', error);
              }
            });

          this.empresasService.obtenerEmpresas()
            .subscribe({
              next: (empresas) => {
                this.empresas.set(empresas);

                if (this.usuario.empresa) {
                  const nombreEmpresa = this.usuario.empresa.toString();

                  this.editarUsuarioForm.patchValue({
                    empresa: this.obtenerEmpresa(nombreEmpresa),
                  });
                  this.busquedaEmpresa.set(nombreEmpresa);
                }

                this.empresasFiltradas.set([]);
                this.mostrarSugerenciasEmpresa.set(false);
              },
              error: (error) => {
                console.error('Ocurrió un error:', error);
              }
            });
        },
        error: (error: HttpErrorResponse) => {
          if (error.status === 404) {
            this.router.navigate(['/private/usuarios']).then(() => {
              toast.error('Usuario no encontrado');
            });
          }
        }
      }
    );
  }

  private obtenerRol(rol: string): number {
    return this.roles().find(r => r.nombre.toLowerCase() == rol.toLowerCase())?.id!;
  }

  private obtenerEmpresa(empresa: string): number {
    return this.empresas().find(e => e.nombre.toLowerCase() == empresa.toLowerCase())?.id!;
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
    this.editarUsuarioForm.controls.empresa.setValue('');
    this.mostrarSugerenciasEmpresa.set(textoBusqueda.length > 0);
    this.actualizarEmpresasFiltradas(textoBusqueda);
  }

  seleccionarEmpresa(empresa: Empresa): void {
    this.editarUsuarioForm.controls.empresa.setValue(empresa.id!);
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

  editarUsuarioForm = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    rol: this.formBuilder.nonNullable.control<number | ''>(
      '',
      [Validators.required],
    ),
    dni: ['', [Validators.required, Validators.pattern(/^\d{8}[a-zA-Z]$/)]],
    nombre: ['', [Validators.required, this.noSoloEspacios]],
    apellidos: ['', [Validators.required, this.noSoloEspacios]],
    telefono: ['', [Validators.required, Validators.pattern(/^\d{9}$/)]],
    fechaNacimiento: ['', [Validators.required, this.fechaNacimientoPasada]],
    empresa: this.formBuilder.nonNullable.control<number | ''>(
      ''),
  }, { validators: this.empresaObligatoriaSegunRol });

  submit(): void {
    this.mensajeError.set(null);

    if (this.editarUsuarioForm.valid) {
      let usuario: Usuario = {
        email: this.editarUsuarioForm.value.email!,
        rol: this.editarUsuarioForm.value.rol!,
        dni: this.editarUsuarioForm.value.dni!,
        nombre: this.editarUsuarioForm.value.nombre!,
        apellidos: this.editarUsuarioForm.value.apellidos!,
        telefono: this.editarUsuarioForm.value.telefono!,
        fechaNacimiento: this.editarUsuarioForm.value.fechaNacimiento!
      }

      if (this.editarUsuarioForm.value.empresa! != '') {
        usuario = { ...usuario, empresa: this.editarUsuarioForm.value.empresa! };
      }

      this.usuariosService.actualizarUsuario(Number(this.id), usuario)
        .subscribe({
          next: (respuesta) => {
            toast.success("Usuario editado correctamente");
            setTimeout(() => {
              this.router.navigate(["/private/usuarios"]);
            }, 1000);
          },
          error: (error: HttpErrorResponse) => {
            this.mensajeError.set(obtenerMensajeErrorAutenticacion(error, 'No se ha podido edtar el usuario.'));
          }
        });
    }
    else {
      this.editarUsuarioForm.markAllAsTouched();
    }
  }
}
