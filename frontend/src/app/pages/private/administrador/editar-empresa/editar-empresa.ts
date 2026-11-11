import { Component, DestroyRef, inject, Input, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { toast, NgxSonnerToaster } from 'ngx-sonner';
import { LocalidadesService } from '../../../../services/localidades.service';
import { EmpresasService } from '../../../../services/empresas.service';
import { Localidad } from '../../../../models/localidad';
import { resetearErroresAlModificarFormulario } from '../../../../utils/form-error-reset';
import { Empresa } from '../../../../models/empresa';
import { HttpErrorResponse } from '@angular/common/http';
import { obtenerMensajeErrorAutenticacion } from '../../../../utils/auth-error-message';

@Component({
  selector: 'app-editar-empresa',
  imports: [ReactiveFormsModule, RouterLink, NgxSonnerToaster],
  templateUrl: './editar-empresa.html',
  styleUrl: './editar-empresa.css',
})
export class EditarEmpresa implements OnInit {

  private formBuilder = inject(FormBuilder);
  private localidadesService = inject(LocalidadesService);
  private empresasService = inject(EmpresasService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);


  localidades = signal<Localidad[]>([]);
  localidadesFiltradas = signal<Localidad[]>([]);
  busquedaLocalidad = signal<string>('');
  mostrarSugerenciasLocalidad = signal<boolean>(false);
  mensajeError = signal<string | null>(null);
  empresa!: Empresa;

  @Input() id!: string;

  private obtenerLocalidad(localidad: string): number{
    return this.localidades().find(l => l.nombre.toLowerCase() == localidad.toLowerCase())?.id!;
  }

  editarEmpresaForm = this.formBuilder.group({
    nombre: ['', [Validators.required]],
    razonSocial: ['', [Validators.required, Validators.pattern(/^[\p{L}\d][\p{L}\d .,'&()/-]{1,149}$/u)]],
    cif: ['', [Validators.required, Validators.pattern(/^[A-HJ-NP-SUVW]\d{7}[0-9A-J]$/)]],
    telefono: ['', [Validators.required, Validators.pattern(/^\d{9}$/)]],
    email: ['', [Validators.required, Validators.email]],
    direccion: ['', [Validators.required]],
    localidad: [null as number | null, [Validators.required]],
  });

  ngOnInit(): void {
    resetearErroresAlModificarFormulario(this.editarEmpresaForm, this.mensajeError, this.destroyRef);

    this.empresasService.obtenerEmpresa(Number(this.id))
      .subscribe({
        next: (empresa: Empresa) => {
          this.empresa = empresa;

          this.editarEmpresaForm.patchValue({
            nombre: this.empresa.nombre,
            razonSocial: this.empresa.razonSocial,
            cif: this.empresa.cif,
            telefono: this.empresa.telefono,
            email: this.empresa.email,
            direccion: this.empresa.direccion,
          });

          this.localidadesService.obtenerLocalidades()
            .subscribe({
              next: (localidades) => {
                this.localidades.set(localidades);
                const nombreLocalidad = this.empresa.localidad.toString();

                this.editarEmpresaForm.patchValue({
                  localidad: this.obtenerLocalidad(nombreLocalidad)
                });
                this.busquedaLocalidad.set(nombreLocalidad);
                this.localidadesFiltradas.set([]);
                this.mostrarSugerenciasLocalidad.set(false);
              },
              error: (error) => {
                console.error('Ocurrió un error:', error);
              }
            });
        },
        error: (error: HttpErrorResponse) => {
          if (error.status === 404) {
            this.router.navigate(['/private/empresas']).then(() => {
              toast.error('Empresa no encontrada');
            });
          }
        }
      });
  }

  manejarBusquedaLocalidad(event: Event): void {
    const textoBusqueda = (event.target as HTMLInputElement).value;

    this.busquedaLocalidad.set(textoBusqueda);
    this.editarEmpresaForm.controls.localidad.setValue(null);
    this.mostrarSugerenciasLocalidad.set(textoBusqueda.length > 0);
    this.actualizarLocalidadesFiltradas(textoBusqueda);
  }

  seleccionarLocalidad(localidad: Localidad): void {
    this.editarEmpresaForm.controls.localidad.setValue(localidad.id);
    this.busquedaLocalidad.set(localidad.nombre);
    this.localidadesFiltradas.set([]);
    this.mostrarSugerenciasLocalidad.set(false);
  }

  private actualizarLocalidadesFiltradas(textoBusqueda: string): void {
    const textoNormalizado = this.normalizarTexto(textoBusqueda);

    this.localidadesFiltradas.set(
      textoNormalizado.length === 0
        ? []
        : this.localidades().filter((localidad) =>
          this.normalizarTexto(localidad.nombre).includes(textoNormalizado),
        ),
    );
  }

  private normalizarTexto(texto: string): string {
    return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es-ES');
  }

  submit(): void {
      this.mensajeError.set(null);
  
      if (this.editarEmpresaForm.valid) {
        let empresa: Empresa = {
          nombre: this.editarEmpresaForm.value.nombre!,
          razonSocial: this.editarEmpresaForm.value.razonSocial!,
          cif: this.editarEmpresaForm.value.cif!,
          telefono: this.editarEmpresaForm.value.telefono!,
          email: this.editarEmpresaForm.value.email!,
          direccion: this.editarEmpresaForm.value.direccion!,
          localidad: this.editarEmpresaForm.value.localidad!
        }
  
        this.empresasService.actualizarEmpresa(Number(this.id), empresa)
        .subscribe({
            next: (respuesta) => {
              toast.success("Empresa editada correctamente");
              setTimeout(() => {
                this.router.navigate(["/private/empresas"]);
              }, 1000);
            },
            error: (error: HttpErrorResponse) => {
              this.mensajeError.set(obtenerMensajeErrorAutenticacion(error, 'No se ha podido editar la empresa.'));
            }
          });
  
      } else {
        this.editarEmpresaForm.markAllAsTouched();
      }
    }

}
