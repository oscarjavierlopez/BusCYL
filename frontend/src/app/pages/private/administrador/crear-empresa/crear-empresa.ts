import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LocalidadesService } from '../../../../services/localidades.service';
import { Localidad } from '../../../../models/localidad';
import { Empresa } from '../../../../models/empresa';
import { EmpresasService } from '../../../../services/empresas.service';
import { toast, NgxSonnerToaster } from 'ngx-sonner';
import { obtenerMensajeErrorAutenticacion } from '../../../../utils/auth-error-message';
import { resetearErroresAlModificarFormulario } from '../../../../utils/form-error-reset';
import { Location } from '@angular/common';

@Component({
  selector: 'app-crear-empresa',
  imports: [ReactiveFormsModule, RouterLink, NgxSonnerToaster],
  templateUrl: './crear-empresa.html',
  styleUrl: './crear-empresa.css',
})
export class CrearEmpresa implements OnInit {
  private formBuilder = inject(FormBuilder);
  private localidadesService = inject(LocalidadesService);
  private empresasService = inject(EmpresasService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private location = inject(Location);


  localidades = signal<Localidad[]>([]);
  localidadesFiltradas = signal<Localidad[]>([]);
  busquedaLocalidad = signal<string>('');
  mostrarSugerenciasLocalidad = signal<boolean>(false);
  mensajeError = signal<string | null>(null);

  crearEmpresaForm = this.formBuilder.group({
    nombre: ['', [Validators.required]],
    razonSocial: ['', [Validators.required, Validators.pattern(/^[\p{L}\d][\p{L}\d .,'&()/-]{1,149}$/u)]],
    cif: ['', [Validators.required, Validators.pattern(/^[A-HJ-NP-SUVW]\d{7}[0-9A-J]$/)]],
    telefono: ['', [Validators.required, Validators.pattern(/^\d{9}$/)]],
    email: ['', [Validators.required, Validators.email]],
    direccion: ['', [Validators.required]],
    localidad: [null as number | null, [Validators.required]],
  });

  ngOnInit(): void {
    resetearErroresAlModificarFormulario(this.crearEmpresaForm, this.mensajeError, this.destroyRef);

    this.localidadesService.obtenerLocalidades()
      .subscribe({
        next: (localidades) => {
          this.localidades.set(localidades);
          this.actualizarLocalidadesFiltradas(this.busquedaLocalidad());
        },
        error: (error) => {
          console.error('Ocurrió un error:', error);
        }
      });
  }

  manejarBusquedaLocalidad(event: Event): void {
    const textoBusqueda = (event.target as HTMLInputElement).value;

    this.busquedaLocalidad.set(textoBusqueda);
    this.crearEmpresaForm.controls.localidad.setValue(null);
    this.mostrarSugerenciasLocalidad.set(textoBusqueda.length > 0);
    this.actualizarLocalidadesFiltradas(textoBusqueda);
  }

  seleccionarLocalidad(localidad: Localidad): void {
    this.crearEmpresaForm.controls.localidad.setValue(localidad.id);
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

    if (this.crearEmpresaForm.valid) {
      let nuevaEmpresa: Empresa = {
        nombre: this.crearEmpresaForm.value.nombre!,
        razonSocial: this.crearEmpresaForm.value.razonSocial!,
        cif: this.crearEmpresaForm.value.cif!,
        telefono: this.crearEmpresaForm.value.telefono!,
        email: this.crearEmpresaForm.value.email!,
        direccion: this.crearEmpresaForm.value.direccion!,
        localidad: this.crearEmpresaForm.value.localidad!
      }

      this.empresasService.crearEmpresa(nuevaEmpresa)
      .subscribe({
          next: (respuesta) => {
            toast.success("Empresa añadida correctamente");
            setTimeout(() => {
              this.location.back();
            }, 1000);
          },
          error: (error: HttpErrorResponse) => {
            this.mensajeError.set(obtenerMensajeErrorAutenticacion(error, 'No se ha podido crear la empresa.'));
          }
        });

    } else {
      this.crearEmpresaForm.markAllAsTouched();
    }
  }
}
