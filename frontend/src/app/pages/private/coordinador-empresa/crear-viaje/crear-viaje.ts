import { Component, inject, OnInit, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Autobus } from '../../../../models/autobus';
import { Conductor } from '../../../../models/conductor';
import { Localidad } from '../../../../models/localidad';
import { AutobusService } from '../../../../services/autobus.service';
import { ConductoresService } from '../../../../services/conductores.service';
import { LocalidadesService } from '../../../../services/localidades.service';
import { RouterLink } from '@angular/router';
import { toast, NgxSonnerToaster } from 'ngx-sonner';
import { Viaje } from '../../../../models/viaje';
import { Parada } from '../../../../models/parada';
import { ViajesService } from '../../../../services/viajes.service';
import { HttpErrorResponse } from '@angular/common/http';
import { obtenerMensajeErrorAutenticacion } from '../../../../utils/auth-error-message';

function fechaFuturaValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    const coincidencias = /^(\d{4})-(\d{2})-(\d{2})$/.exec(control.value);

    if (!coincidencias) {
      return { fechaInvalida: true };
    }

    const anio = Number(coincidencias[1]);
    const mes = Number(coincidencias[2]) - 1;
    const dia = Number(coincidencias[3]);
    const fecha = new Date(anio, mes, dia);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    if (
      fecha.getFullYear() !== anio ||
      fecha.getMonth() !== mes ||
      fecha.getDate() !== dia ||
      fecha.getTime() <= hoy.getTime()
    ) {
      return { fechaNoFutura: true };
    }

    return null;
  };
}

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
  selector: 'app-crear-viaje',
  imports: [ReactiveFormsModule, RouterLink, NgxSonnerToaster],
  templateUrl: './crear-viaje.html',
  styleUrl: './crear-viaje.css',
})
export class CrearViaje implements OnInit {
  private formBuilder = inject(FormBuilder);
  private localidadesService = inject(LocalidadesService);
  private autobusService = inject(AutobusService);
  private conductoresService = inject(ConductoresService);
  private viajeService = inject(ViajesService);
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
  diasSeleccionados = signal<number[]>([1, 2, 3, 4, 5]);
  diasSemana = [
    { numero: 1, etiqueta: 'Lunes', abreviatura: 'L' },
    { numero: 2, etiqueta: 'Martes', abreviatura: 'M' },
    { numero: 3, etiqueta: 'Miércoles', abreviatura: 'X' },
    { numero: 4, etiqueta: 'Jueves', abreviatura: 'J' },
    { numero: 5, etiqueta: 'Viernes', abreviatura: 'V' },
    { numero: 6, etiqueta: 'Sábado', abreviatura: 'S' },
    { numero: 0, etiqueta: 'Domingo', abreviatura: 'D' },
  ];

  crearViajeForm = this.formBuilder.group({
    idOrigen: [null as number | null, [Validators.required]],
    idDestino: [null as number | null, [Validators.required]],
    idAutobus: [null as number | null, [Validators.required]],
    idConductor: [null as number | null, [Validators.required]],
    fechaInicio: ['', [Validators.required, fechaFuturaValidator()]],
    fechaFin: ['', [Validators.required, fechaFuturaValidator()]],
    dias: [[1, 2, 3, 4, 5] as number[], [Validators.required, Validators.minLength(1)]],
    horaSalida: ['', [Validators.required]],
    horaLlegada: ['', [Validators.required]],
    paradas: this.formBuilder.array([
      this.crearParada(1),
      this.crearParada(2),
    ]),
  }, { validators: horaLlegadaPosteriorValidator });

  ngOnInit(): void {
    this.crearViajeForm.valueChanges.subscribe(() => {
      this.mensajeError.set(null);
    });

    this.localidadesService.obtenerLocalidades().subscribe({
      next: (localidades) => this.localidades.set(localidades),
      error: (error) => console.error('Ocurrió un error:', error),
    });

    this.autobusService.obtenerAutobuses().subscribe({
      next: (autobuses) => this.autobuses.set(autobuses),
      error: (error) => console.error('Ocurrió un error:', error),
    });

    this.conductoresService.obtenerConductores().subscribe({
      next: (conductores) => this.conductores.set(conductores),
      error: (error) => console.error('Ocurrió un error:', error),
    });
  }

  manejarBusquedaOrigen(event: Event): void {
    const textoBusqueda = (event.target as HTMLInputElement).value;

    this.busquedaOrigen.set(textoBusqueda);
    this.crearViajeForm.controls.idOrigen.setValue(null);
    this.mostrarSugerenciasOrigen.set(textoBusqueda.length > 0);
    this.localidadesOrigenFiltradas.set(this.filtrarLocalidades(textoBusqueda));
  }

  manejarBusquedaDestino(event: Event): void {
    const textoBusqueda = (event.target as HTMLInputElement).value;

    this.busquedaDestino.set(textoBusqueda);
    this.crearViajeForm.controls.idDestino.setValue(null);
    this.mostrarSugerenciasDestino.set(textoBusqueda.length > 0);
    this.localidadesDestinoFiltradas.set(this.filtrarLocalidades(textoBusqueda));
  }

  manejarBusquedaAutobus(event: Event): void {
    const textoBusqueda = (event.target as HTMLInputElement).value;

    this.busquedaAutobus.set(textoBusqueda);
    this.crearViajeForm.controls.idAutobus.setValue(null);
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
    this.crearViajeForm.controls.idConductor.setValue(null);
    this.mostrarSugerenciasConductor.set(textoBusqueda.length > 0);
    this.conductoresFiltrados.set(
      this.conductores().filter((conductor) =>
        this.normalizarTexto(`${conductor.nombre} ${conductor.apellidos}`).includes(this.normalizarTexto(textoBusqueda)),
      ),
    );
  }

  seleccionarOrigen(localidad: Localidad): void {
    this.crearViajeForm.controls.idOrigen.setValue(localidad.id);
    this.busquedaOrigen.set(localidad.nombre);
    this.localidadesOrigenFiltradas.set([]);
    this.mostrarSugerenciasOrigen.set(false);
    this.asignarLocalidadParada(0, localidad);
  }

  seleccionarDestino(localidad: Localidad): void {
    this.crearViajeForm.controls.idDestino.setValue(localidad.id);
    this.busquedaDestino.set(localidad.nombre);
    this.localidadesDestinoFiltradas.set([]);
    this.mostrarSugerenciasDestino.set(false);
    this.asignarLocalidadParada(this.paradas.length - 1, localidad);
  }

  seleccionarAutobus(autobus: Autobus): void {
    this.crearViajeForm.controls.idAutobus.setValue(autobus.id ?? null);
    this.busquedaAutobus.set(autobus.matricula);
    this.autobusesFiltrados.set([]);
    this.mostrarSugerenciasAutobus.set(false);
  }

  seleccionarConductor(conductor: Conductor): void {
    this.crearViajeForm.controls.idConductor.setValue(conductor.id);
    this.busquedaConductor.set(`${conductor.nombre} ${conductor.apellidos}`);
    this.conductoresFiltrados.set([]);
    this.mostrarSugerenciasConductor.set(false);
  }

  alternarDia(dia: number): void {
    const dias = this.diasSeleccionados();
    const diasActualizados = dias.includes(dia)
      ? dias.filter((diaSeleccionado) => diaSeleccionado !== dia)
      : [...dias, dia].sort((diaA, diaB) => this.ordenDia(diaA) - this.ordenDia(diaB));

    this.diasSeleccionados.set(diasActualizados);
    this.crearViajeForm.controls.dias.setValue(diasActualizados);
    this.crearViajeForm.controls.dias.markAsTouched();
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
    return this.crearViajeForm.controls.paradas;
  }

  submit(): void {
    if (this.crearViajeForm.valid) {
      let fecha = new Date(this.crearViajeForm.value.fechaInicio!);
      const fechaFin = new Date(this.crearViajeForm.value.fechaFin!);
      let fechas: string[] = [];

      while (fecha! <= fechaFin) {
        if (this.crearViajeForm.value.dias?.includes(fecha.getDay())) {
          let dia = fecha.getDate() <= 9 ? `0${fecha.getDate()}` : fecha.getDate();
          fechas.push(`${fecha.getFullYear()}-${fecha.getMonth() + 1}-${dia}`);
        }

        fecha.setDate(fecha.getDate() + 1);
      }

      let paradas: Parada[] = [];
      for (const p of this.crearViajeForm.value.paradas!) {
        let parada: Parada = {
          idLocalidad: p.idLocalidad!,
          direccion: p.direccion!,
          orden: p.orden!,
          horaLlegada: `${p.horaLlegada!}:00`,
          horaSalida: p.horaSalida! ?  `${p.horaSalida!}:00` : null
        }
        paradas.push(parada);
      }

      let viaje: Viaje = {
        idOrigen: this.crearViajeForm.value.idOrigen!,
        idDestino: this.crearViajeForm.value.idDestino!,
        idAutobus: this.crearViajeForm.value.idAutobus!,
        idConductor: this.crearViajeForm.value.idConductor!,
        fechas: fechas,
        horaSalida: `${this.crearViajeForm.value.horaSalida!}:00`,
        horaLlegada: `${this.crearViajeForm.value.horaLlegada!}:00`,
        paradas: paradas
      }
      
      this.viajeService.crearViaje(viaje).subscribe(
        {
          next: (respuesta) => {
            toast.success(`Se añadieron ${respuesta.length} viajes`);
            this.crearViajeForm.reset();
          },error: (error: HttpErrorResponse) => {
          this.mensajeError.set(obtenerMensajeErrorAutenticacion(error, 'No se ha podido crear la empresa.'));
        }
        }
      );
    } else {
      this.crearViajeForm.markAllAsTouched();
    }
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
}
