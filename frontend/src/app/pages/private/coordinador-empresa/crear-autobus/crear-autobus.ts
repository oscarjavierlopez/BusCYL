import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AutobusService } from '../../../../services/autobus.service';
import { resetearErroresAlModificarFormulario } from '../../../../utils/form-error-reset';
import { Asiento } from '../../../../models/asiento';
import { Autobus } from '../../../../models/autobus';
import { toast, NgxSonnerToaster } from 'ngx-sonner';
import { Location } from '@angular/common';
import { obtenerMensajeErrorAutenticacion } from '../../../../utils/auth-error-message';
import { HttpErrorResponse } from '@angular/common/http';
import { organizarAsientosEnFilas } from '../../../../utils/asientos-layout';

type Estado = "No averiado" | "averiado";
type Tipo = "normal" | "adaptado";

@Component({
  selector: 'app-crear-autobus',
  imports: [ReactiveFormsModule, RouterLink, NgxSonnerToaster],
  templateUrl: './crear-autobus.html',
  styleUrl: './crear-autobus.css',
})
export class CrearAutobus implements OnInit {
  private formBuilder = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private autobusesService = inject(AutobusService);
  mensajeError = signal<string | null>(null);
  private location = inject(Location);

  asientos = signal<Asiento[]>([]);
  tipo = signal<Tipo>("normal");
  estado = signal<Estado>("No averiado");
  filasAsientos = computed(() => organizarAsientosEnFilas(this.asientos()));
  numeroAsientosAdaptados = computed(() => this.asientos().filter((asiento) => asiento.tipo === 'adaptado').length);
  numeroAsientosAveriados = computed(() => this.asientos().filter((asiento) => !asiento.activo).length);

  crearAutobusForm = this.formBuilder.group({
    matricula: ['', [Validators.required, Validators.pattern(/^\d{4}[BCDFGHJKLMNPRSTVWXYZ]{3}$/)]],
    numeroBastidor: ['', [Validators.required, Validators.pattern(/^[A-HJ-NPR-Z0-9]{17}$/)]],
    numeroFlota: ['', [Validators.required, Validators.pattern(/^[A-Z0-9-]{1,20}$/)]],
    numeroAsientos: [50, [Validators.required, Validators.min(0), Validators.max(250)]],
  });

  ngOnInit(): void {
    resetearErroresAlModificarFormulario(this.crearAutobusForm, this.mensajeError, this.destroyRef);
    this.generarAsientos(this.crearAutobusForm.controls.numeroAsientos.value);

    this.crearAutobusForm.controls.numeroAsientos.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((numeroAsientos) => {
        this.generarAsientos(numeroAsientos);
      });
  }

  seleccionarTipo(tipo: Tipo): void {
    this.tipo.set(tipo);
  }

  seleccionarEstado(estado: Estado): void {
    this.estado.set(estado);
  }

  modificarAsiento(numero: number): void {
    this.asientos.update((asientos) =>
      asientos.map((asiento) =>
        asiento.numero === numero
          ? { ...asiento, tipo: this.tipo(), activo: this.estado() === 'No averiado' }
          : asiento,
      ),
    );
  }

  private generarAsientos(numeroAsientos: number | null): void {
    if (!Number.isInteger(numeroAsientos) || numeroAsientos === null || numeroAsientos < 1 || numeroAsientos > 250) {
      return;
    }

    this.asientos.update((asientos) => {
      if (numeroAsientos <= asientos.length) {
        return asientos.slice(0, numeroAsientos);
      }

      const nuevosAsientos = Array.from({ length: numeroAsientos - asientos.length }, (_, indice) => ({
        numero: asientos.length + indice + 1,
        tipo: 'normal',
        activo: true,
      }));

      return [...asientos, ...nuevosAsientos];
    });
  }

  submit(): void {
    if (this.crearAutobusForm.valid) {
      let nuevoAutobus: Autobus = {
        matricula: this.crearAutobusForm.value.matricula!,
        numeroBastidor: this.crearAutobusForm.value.numeroBastidor!,
        numeroFlota: this.crearAutobusForm.value.numeroFlota!,
        asientos: this.asientos()
      }
      this.autobusesService.crearAutobus(nuevoAutobus).subscribe({
        next: (respuesta) => {
          toast.success("Autobus añadido correctamente");
          setTimeout(() => {
            this.location.back();
          }, 1000);
        },
        error: (error: HttpErrorResponse) => {
          this.mensajeError.set(obtenerMensajeErrorAutenticacion(error, 'No se ha podido crear la empresa.'));
        }
      });

    } else {
      this.crearAutobusForm.markAllAsTouched();
    }
  }
}
