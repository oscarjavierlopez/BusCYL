import { Component, DestroyRef, inject, Input, OnInit, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Localidad } from '../../../../models/localidad';
import { Router, RouterLink } from '@angular/router';
import { toast, NgxSonnerToaster } from 'ngx-sonner';
import { LocalidadesService } from '../../../../services/localidades.service';
import { AutobusService } from '../../../../services/autobus.service';
import { ConductoresService } from '../../../../services/conductores.service';
import { ViajesService } from '../../../../services/viajes.service';
import { Autobus } from '../../../../models/autobus';
import { Conductor } from '../../../../models/conductor';
import { Viaje } from '../../../../models/viaje';
import { Parada } from '../../../../models/parada';
import { HttpErrorResponse } from '@angular/common/http';
import { Location } from '@angular/common';
import { obtenerMensajeErrorAutenticacion } from '../../../../utils/auth-error-message';


function horaLlegadaPosteriorValidator(control: AbstractControl): ValidationErrors | null {
  const horaSalida = control.get('horaSalida')?.value as string;
  const horaLlegada = control.get('horaLlegada')?.value as string;

  if (!horaSalida || !horaLlegada) {
    return null;
  }

  return horaLlegada > horaSalida ? null : { horaLlegadaNoPosterior: true };
}

interface EstadoBusquedaParada {
  texto: string;
  localidades: Localidad[];
  mostrar: boolean;
}

function horarioParadaValidator(control: AbstractControl): ValidationErrors | null {
  const horaLlegada = control.get('horaLlegada')?.value as string;
  const horaSalida = control.get('horaSalida')?.value as string;
  const horaSalidaViaje = control.root.get('horaSalida')?.value as string;
  const horaLlegadaViaje = control.root.get('horaLlegada')?.value as string;
  const errores: ValidationErrors = {};

  if (horaLlegada && horaSalida && horaSalida <= horaLlegada) {
    errores['horaSalidaNoPosterior'] = true;
  }

  if (horaSalidaViaje && horaLlegadaViaje) {
    if (horaLlegada && (horaLlegada < horaSalidaViaje || horaLlegada > horaLlegadaViaje)) {
      errores['horaLlegadaFueraDeHorario'] = true;
    }

    if (horaSalida && (horaSalida < horaSalidaViaje || horaSalida > horaLlegadaViaje)) {
      errores['horaSalidaFueraDeHorario'] = true;
    }
  }

  return Object.keys(errores).length > 0 ? errores : null;
}
@Component({
  selector: 'app-editar-viaje',
  imports: [ReactiveFormsModule, RouterLink, NgxSonnerToaster],
  templateUrl: './editar-viaje.html',
  styleUrl: './editar-viaje.css',
})
export class EditarViaje implements OnInit {
  private formBuilder = inject(FormBuilder);
  private localidadesService = inject(LocalidadesService);
  private autobusService = inject(AutobusService);
  private conductoresService = inject(ConductoresService);
  private viajeService = inject(ViajesService);
  private router = inject(Router);
  private location = inject(Location);
  mensajeError = signal<string | null>(null);

  localidades = signal<Localidad[]>([]);
  autobuses = signal<Autobus[]>([]);
  conductores = signal<Conductor[]>([]);
  localidadesOrigenFiltradas = signal<Localidad[]>([]);
  localidadesDestinoFiltradas = signal<Localidad[]>([]);
  autobusesFiltrados = signal<Autobus[]>([]);
  conductoresFiltrados = signal<Conductor[]>([]);
  busquedaOrigen = signal<string>('');
  busquedaDestino = signal<string>('');
  busquedaAutobus = signal<string>('');
  busquedaConductor = signal<string>('');
  mostrarSugerenciasOrigen = signal<boolean>(false);
  mostrarSugerenciasDestino = signal<boolean>(false);
  mostrarSugerenciasAutobus = signal<boolean>(false);
  mostrarSugerenciasConductor = signal<boolean>(false);
  estadosBusquedaParadas = signal<EstadoBusquedaParada[]>([
    { texto: '', localidades: [], mostrar: false },
    { texto: '', localidades: [], mostrar: false },
  ]);

  @Input() id!: string;
  viaje!: Viaje;

  editarViajeForm = this.formBuilder.group({
    idOrigen: [null as number | null, [Validators.required]],
    idDestino: [null as number | null, [Validators.required]],
    idAutobus: [null as number | null, [Validators.required]],
    idConductor: [null as number | null, [Validators.required]],
    fecha: ['', [Validators.required]],
    horaSalida: ['', [Validators.required]],
    horaLlegada: ['', [Validators.required]],
    paradas: this.formBuilder.array<ReturnType<EditarViaje['crearParada']>>([]),
  }, { validators: horaLlegadaPosteriorValidator });

  ngOnInit(): void {
    this.editarViajeForm.valueChanges.subscribe(() => {
      this.mensajeError.set(null);
    });

    this.viajeService.obtenerViaje(Number(this.id))
      .subscribe({
        next: (viaje: Viaje) => {
          this.viaje = viaje;

          this.editarViajeForm.patchValue({
            fecha: viaje.fecha,
            horaSalida: viaje.horaSalida,
            horaLlegada: viaje.horaLLegada!,
          });

          this.localidadesService.obtenerLocalidades().subscribe({
            next: (localidades) => {
              this.localidades.set(localidades);
              this.cargarParadas(this.viaje.paradas!);
              this.editarViajeForm.patchValue({
                idOrigen: this.obtenerLocalidad(this.viaje.origen!).id,
                idDestino: this.obtenerLocalidad(this.viaje.destino!).id,
              });

              this.seleccionarOrigen(this.obtenerLocalidad(this.viaje.origen!))
              this.seleccionarDestino(this.obtenerLocalidad(this.viaje.destino!))
            },
            error: (error) => console.error('Ocurrió un error:', error),
          });

          this.autobusService.obtenerAutobuses().subscribe({
            next: (autobuses) => {
              this.autobuses.set(autobuses)
              this.editarViajeForm.patchValue({
                idAutobus: this.viaje.autobus?.id!
              });
              this.seleccionarAutobus(this.obtenerAutobus(this.viaje?.autobus?.id!))
            },
            error: (error) => console.error('Ocurrió un error:', error),
          });

          this.conductoresService.obtenerConductores().subscribe({
            next: (conductores) => {
              this.conductores.set(conductores)
              this.editarViajeForm.patchValue({
                idConductor: this.viaje.conductor?.id
              });
              this.seleccionarConductor(this.obtenerConductor(this.viaje.conductor?.id!));
            },
            error: (error) => console.error('Ocurrió un error:', error),
          });
        },
        error: (error: HttpErrorResponse) => {
          this.router.navigate(['/private/viajes/coordinador'])
        }
      });
  }

  manejarBusquedaOrigen(event: Event): void {
    const textoBusqueda = (event.target as HTMLInputElement).value;

    this.busquedaOrigen.set(textoBusqueda);
    this.editarViajeForm.controls.idOrigen.setValue(null);
    this.mostrarSugerenciasOrigen.set(textoBusqueda.length > 0);
    this.localidadesOrigenFiltradas.set(this.filtrarLocalidades(textoBusqueda));
  }

  manejarBusquedaDestino(event: Event): void {
    const textoBusqueda = (event.target as HTMLInputElement).value;

    this.busquedaDestino.set(textoBusqueda);
    this.editarViajeForm.controls.idDestino.setValue(null);
    this.mostrarSugerenciasDestino.set(textoBusqueda.length > 0);
    this.localidadesDestinoFiltradas.set(this.filtrarLocalidades(textoBusqueda));
  }

  manejarBusquedaAutobus(event: Event): void {
    const textoBusqueda = (event.target as HTMLInputElement).value;

    this.busquedaAutobus.set(textoBusqueda);
    this.editarViajeForm.controls.idAutobus.setValue(null);
    this.mostrarSugerenciasAutobus.set(textoBusqueda.length > 0);
    this.autobusesFiltrados.set(
      this.autobuses().filter((autobus) =>
        autobus.matricula.toLocaleLowerCase('es-ES').includes(textoBusqueda.toLocaleLowerCase('es-ES')),
      ),
    );
  }

  manejarBusquedaConductor(event: Event): void {
    const textoBusqueda = (event.target as HTMLInputElement).value;

    this.busquedaConductor.set(textoBusqueda);
    this.editarViajeForm.controls.idConductor.setValue(null);
    this.mostrarSugerenciasConductor.set(textoBusqueda.length > 0);
    this.conductoresFiltrados.set(
      this.conductores().filter((conductor) =>
        this.normalizarTexto(`${conductor.nombre} ${conductor.apellidos}`).includes(this.normalizarTexto(textoBusqueda)),
      ),
    );
  }

  seleccionarOrigen(localidad: Localidad): void {
    this.editarViajeForm.controls.idOrigen.setValue(localidad.id);
    this.busquedaOrigen.set(localidad.nombre);
    this.localidadesOrigenFiltradas.set([]);
    this.mostrarSugerenciasOrigen.set(false);
    this.asignarLocalidadParada(0, localidad);
  }

  seleccionarDestino(localidad: Localidad): void {
    this.editarViajeForm.controls.idDestino.setValue(localidad.id);
    this.busquedaDestino.set(localidad.nombre);
    this.localidadesDestinoFiltradas.set([]);
    this.mostrarSugerenciasDestino.set(false);
    this.asignarLocalidadParada(this.paradas.length - 1, localidad);
  }

  seleccionarAutobus(autobus: Autobus): void {
    this.editarViajeForm.controls.idAutobus.setValue(autobus.id ?? null);
    this.busquedaAutobus.set(autobus.matricula);
    this.autobusesFiltrados.set([]);
    this.mostrarSugerenciasAutobus.set(false);
  }

  seleccionarConductor(conductor: Conductor): void {
    this.editarViajeForm.controls.idConductor.setValue(conductor.id);
    this.busquedaConductor.set(`${conductor.nombre} ${conductor.apellidos}`);
    this.conductoresFiltrados.set([]);
    this.mostrarSugerenciasConductor.set(false);
  }

  agregarParada(indiceParada: number): void {
    const indiceNuevaParada = indiceParada + 1;

    this.paradas.insert(indiceNuevaParada, this.crearParada(indiceNuevaParada + 1));
    this.estadosBusquedaParadas.update((estados) => {
      const estadosActualizados = [...estados];
      estadosActualizados.splice(indiceNuevaParada, 0, { texto: '', localidades: [], mostrar: false });
      return estadosActualizados;
    });
    this.renumerarParadas();
    this.actualizarValidacionesParadas();
  }

  eliminarParada(indice: number): void {
    if (indice === 0 || indice === this.paradas.length - 1) {
      return;
    }

    this.paradas.removeAt(indice);
    this.estadosBusquedaParadas.update((estados) => estados.filter((_, indiceEstado) => indiceEstado !== indice));
    this.renumerarParadas();
    this.actualizarValidacionesParadas();
  }

  manejarBusquedaParada(event: Event, indice: number): void {
    const textoBusqueda = (event.target as HTMLInputElement).value;
    const parada = this.paradas.at(indice);

    parada.controls.idLocalidad.setValue(null);
    this.actualizarEstadoBusquedaParada(indice, {
      texto: textoBusqueda,
      localidades: this.filtrarLocalidades(textoBusqueda),
      mostrar: textoBusqueda.length > 0,
    });
  }

  seleccionarLocalidadParada(localidad: Localidad, indice: number): void {
    this.asignarLocalidadParada(indice, localidad);
  }

  actualizarValidacionesParadas(): void {
    this.paradas.controls.forEach((parada) => parada.updateValueAndValidity());
  }

  get paradas() {
    return this.editarViajeForm.controls.paradas;
  }

  private filtrarLocalidades(textoBusqueda: string): Localidad[] {
    const textoNormalizado = this.normalizarTexto(textoBusqueda);

    return textoNormalizado.length === 0
      ? []
      : this.localidades().filter((localidad) =>
        this.normalizarTexto(localidad.nombre).includes(textoNormalizado),
      );
  }

  private normalizarTexto(texto: string): string {
    return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es-ES');
  }

  private ordenDia(dia: number): number {
    return dia === 0 ? 7 : dia;
  }

  private crearParada(orden: number) {
    return this.formBuilder.group({
      idLocalidad: [null as number | null, [Validators.required]],
      direccion: ['', [Validators.required]],
      horaLlegada: ['', [Validators.required]],
      horaSalida: [''],
      orden: [orden, [Validators.required, Validators.min(1)]],
    }, { validators: horarioParadaValidator });
  }

  private cargarParadas(paradas: Parada[]): void {
    this.paradas.clear();
    this.estadosBusquedaParadas.set([]);

    [...paradas]
      .sort((paradaA, paradaB) => paradaA.orden - paradaB.orden)
      .forEach((parada) => {
        const localidad = this.obtenerLocalidad(parada.localidad!);
        const controlParada = this.crearParada(parada.orden);

        controlParada.patchValue({
          idLocalidad: localidad.id,
          direccion: parada.direccion,
          horaLlegada: parada.horaLlegada,
          horaSalida: parada.horaSalida ?? '',
          orden: parada.orden,
        });
        this.paradas.push(controlParada);
        this.estadosBusquedaParadas.update((estados) => [
          ...estados,
          { texto: localidad.nombre, localidades: [], mostrar: false },
        ]);
      });

    this.actualizarValidacionesParadas();
  }

  private asignarLocalidadParada(indice: number, localidad: Localidad): void {
    this.paradas.at(indice).controls.idLocalidad.setValue(localidad.id);
    this.actualizarEstadoBusquedaParada(indice, { texto: localidad.nombre, localidades: [], mostrar: false });
  }

  private actualizarEstadoBusquedaParada(indice: number, estado: EstadoBusquedaParada): void {
    this.estadosBusquedaParadas.update((estados) =>
      estados.map((estadoActual, indiceEstado) => indiceEstado === indice ? estado : estadoActual),
    );
  }

  private renumerarParadas(): void {
    this.paradas.controls.forEach((parada, indice) => {
      parada.controls.orden.setValue(indice + 1, { emitEvent: false });
    });
  }

  private obtenerLocalidad(nombre: string): Localidad {
    return this.localidades().find(l => l.nombre.toLowerCase() == nombre.toLowerCase())!;
  }

  private obtenerAutobus(id: number): Autobus {
    return this.autobuses().find(a => a.id == id)!;
  }

  private obtenerConductor(id: number): Conductor {
    return this.conductores().find(c => c.id == id)!;
  }

  submit(): void {
    if (this.editarViajeForm.valid) {
      let paradas: Parada[] = [];
      for (const p of this.editarViajeForm.value.paradas!) {
        let parada: Parada = {
          idLocalidad: p.idLocalidad!,
          direccion: p.direccion!,
          orden: p.orden!,
          horaLlegada: `${p.horaLlegada!.substring(0,5)}:00`,
          horaSalida: p.horaSalida ? `${p.horaSalida!.substring(0,5)}:00` : null
        }
        paradas.push(parada);
      }

      let viaje: Viaje = {
        idOrigen: this.editarViajeForm.value.idOrigen!,
        idDestino: this.editarViajeForm.value.idDestino!,
        idAutobus: this.editarViajeForm.value.idAutobus!,
        idConductor: this.editarViajeForm.value.idConductor!,
        fecha: this.editarViajeForm.value.fecha!,
        horaSalida: `${this.editarViajeForm.value.horaSalida!}`,
        horaLlegada: `${this.editarViajeForm.value.horaLlegada!}`,
        paradas: paradas
      }

      this.viajeService.actualizarViaje(this.viaje.id!, viaje)
        .subscribe(
          {
            next: (respuesta) => {
              toast.success(`Viaje modificado correctamente`);
              setTimeout(() => {
                this.goBack();
              }, 1000);
            }, error: (error: HttpErrorResponse) => {
              this.mensajeError.set(obtenerMensajeErrorAutenticacion(error, 'No se ha podido crear la empresa.'));
            }
          }
        );

    } else {
      this.editarViajeForm.markAllAsTouched();
    }
  }

  goBack(): void {
    this.location.back();
  }
}
