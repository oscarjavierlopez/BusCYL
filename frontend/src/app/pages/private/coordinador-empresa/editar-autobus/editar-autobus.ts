import { Component, computed, DestroyRef, inject, Input, OnInit, signal } from '@angular/core';
import { Asiento } from '../../../../models/asiento';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { toast, NgxSonnerToaster } from 'ngx-sonner';
import { AutobusService } from '../../../../services/autobus.service';
import { Autobus } from '../../../../models/autobus';
import { resetearErroresAlModificarFormulario } from '../../../../utils/form-error-reset';
import { HttpErrorResponse } from '@angular/common/http';
import { Location } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

type Estado = "No averiado" | "averiado";
type Tipo = "normal" | "adaptado";

interface FilaAsientos {
  asientos: Asiento[];
  ultima: boolean;
}

@Component({
  selector: 'app-editar-autobus',
  imports: [ReactiveFormsModule, RouterLink, NgxSonnerToaster],
  templateUrl: './editar-autobus.html',
  styleUrl: './editar-autobus.css',
})
export class EditarAutobus implements OnInit {
  private formBuilder = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private autobusesService = inject(AutobusService);
  private router = inject(Router);
  mensajeError = signal<string | null>(null);
  private location = inject(Location);
  @Input() id!: string;


  autobus!: Autobus;
  asientos = signal<Asiento[]>([]);
  tipo = signal<Tipo>("normal");
  estado = signal<Estado>("No averiado");
  filasAsientos = computed<FilaAsientos[]>(() => this.organizarAsientosEnFilas(this.asientos()));
  numeroAsientosAdaptados = computed(() => this.asientos().filter((asiento) => asiento.tipo === 'adaptado').length);
  numeroAsientosAveriados = computed(() => this.asientos().filter((asiento) => !asiento.activo).length);

  editarAutobusForm = this.formBuilder.group({
    matricula: ['', [Validators.required, Validators.pattern(/^\d{4}[BCDFGHJKLMNPRSTVWXYZ]{3}$/)]],
    numeroBastidor: ['', [Validators.required, Validators.pattern(/^[A-HJ-NPR-Z0-9]{17}$/)]],
    numeroFlota: ['', [Validators.required, Validators.pattern(/^[A-Z0-9-]{1,20}$/)]],
    numeroAsientos: [50, [Validators.required, Validators.min(0), Validators.max(250)]],
  });

  ngOnInit(): void {
    resetearErroresAlModificarFormulario(this.editarAutobusForm, this.mensajeError, this.destroyRef);

    this.autobusesService.obtenerAutobus(Number(this.id))
      .subscribe({
        next: (autobus: Autobus) => {
          this.autobus = autobus;
          this.asientos.set(autobus.asientos);

          this.editarAutobusForm.patchValue({
            matricula: this.autobus.matricula,
            numeroBastidor: this.autobus.numeroBastidor,
            numeroFlota: this.autobus.numeroFlota,
            numeroAsientos: autobus.asientos.length
          })

          this.editarAutobusForm.controls.numeroAsientos.valueChanges
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((numeroAsientos) => {
              this.generarAsientos(numeroAsientos);
            });
        },
        error: (error: HttpErrorResponse) => {
          if (error.status === 404 || error.status === 403) {
            this.router.navigate(['/private/autobuses']).then(() => {
              toast.error('Autobus no encontrado');
            });
          }
        }
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
      this.asientos.set([]);
      return;
    }

    this.asientos.set(
      Array.from({ length: numeroAsientos }, (_, indice) => ({
        numero: indice + 1,
        tipo: 'normal',
        activo: true,
      })),
    );
  }

  private organizarAsientosEnFilas(asientos: Asiento[]): FilaAsientos[] {
    const asientosPorFila = 4;
    let plazasUltimaFila = asientos.length % asientosPorFila;

    if (plazasUltimaFila === 1 && asientos.length > 5) {
      plazasUltimaFila = 5;
    }

    const plazasFilasCompletas = asientos.length - plazasUltimaFila;
    const filas: FilaAsientos[] = [];

    for (let indice = 0; indice < plazasFilasCompletas; indice += asientosPorFila) {
      filas.push({ asientos: asientos.slice(indice, indice + asientosPorFila), ultima: false });
    }

    if (plazasUltimaFila > 0) {
      filas.push({ asientos: asientos.slice(plazasFilasCompletas), ultima: true });
    }

    return filas;
  }

  submit(): void {
    if (this.editarAutobusForm.valid) {

    } else {
      this.editarAutobusForm.markAllAsTouched();
    }
  }
}
