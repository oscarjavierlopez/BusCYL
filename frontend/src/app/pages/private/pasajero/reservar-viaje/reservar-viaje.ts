import { Component, computed, inject, Input, OnInit, signal } from '@angular/core';
import { ViajesService } from '../../../../services/viajes.service';
import { ReservasService } from '../../../../services/reservas.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Location } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { toast, NgxSonnerToaster } from 'ngx-sonner';
import { Viaje } from '../../../../models/viaje';
import { Parada } from '../../../../models/parada';
import { Asiento } from '../../../../models/asiento';
import { ParadaCard } from '../../../../components/parada-card/parada-card';
import { organizarAsientosEnFilas } from '../../../../utils/asientos-layout';
import { Reserva } from '../../../../models/reserva';
import { obtenerMensajeErrorAutenticacion } from '../../../../utils/auth-error-message';

@Component({
  selector: 'app-reservar-viaje',
  imports: [NgxSonnerToaster, ParadaCard, RouterLink],
  templateUrl: './reservar-viaje.html',
  styleUrl: './reservar-viaje.css',
})
export class ReservarViaje implements OnInit {
  idParadaOrigen = signal<number | null>(null);
  idParadaDestino = signal<number | null>(null);
  idAsiento = signal<number | null>(null);
  paso = signal<number>(1);
  loading = signal<boolean>(false);

  paradasOrigen = signal<Parada[]>([]);
  paradasDestino = signal<Parada[]>([]);
  asientos = signal<Asiento[]>([]);
  reserva = signal<Reserva | null>(null);
  filasAsientos = computed(() => organizarAsientosEnFilas(this.asientos()));

  mensajeError = signal<string>('');
  mostrarMensajeError = signal<boolean>(false);

  private viajeService = inject(ViajesService);
  private reservasService = inject(ReservasService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private location = inject(Location);

  private idOrigen!: number;
  private idDestino!: number;
  @Input() id!: string;
  viaje!: Viaje;

  private leerQueryParams(): void {
    this.route.queryParams.subscribe(params => {
      if (!params["idOrigen"] || !params["idDestino"]) {
        this.location.back();
      } else {
        this.idOrigen = Number(params["idOrigen"]);
        this.idDestino = Number(params["idDestino"]);
      }
    });
  }

  private obtenerViaje(): void {
    this.loading.set(true);
    this.viajeService.obtenerViaje(Number(this.id), this.idOrigen, this.idDestino)
      .subscribe({
        next: (viaje: Viaje) => {
          this.viaje = viaje;
          this.loading.set(false);
          this.paradasOrigen.set(this.obtenerParadasOrigen());
          this.paradasDestino.set(this.obtenerParadasDestino());
        },
        error: (error: HttpErrorResponse) => {
          if (error.status === 404 || error.status === 403) {
            this.loading.set(false);
            this.router.navigate(['/private/viajes/pasajero/buscar']).then(() => {
              toast.error('Viaje no encontrado');
            });
          }
        }
      });
  }

  private obtenerAsientos(): void {
    this.loading.set(true);
    this.viajeService.obtenerAsientosViaje(Number(this.id), this.idParadaOrigen()!, this.idParadaDestino()!)
      .subscribe({
        next: (asientos: Asiento[]) => {
          this.asientos.set(asientos);
          this.loading.set(false);
        },
        error: (error: HttpErrorResponse) => {
          if (error.status === 404 || error.status === 403) {
            this.loading.set(false);
            this.router.navigate(['/private/viajes/pasajero/buscar']).then(() => {
              toast.error('Viaje no encontrado');
            });
          }
        }
      });
  }

  private obtenerParadasOrigen(): Parada[] {
    const primeraParada = this.viaje.paradas![0];
    return this.viaje.paradas?.filter(p => p.localidad == primeraParada.localidad)!;
  }

  private obtenerParadasDestino(): Parada[] {
    const ultimaParada = this.viaje.paradas![this.viaje.paradas!.length - 1];
    return this.viaje.paradas?.filter(p => p.localidad == ultimaParada.localidad)!;
  }

  ngOnInit(): void {
    this.leerQueryParams();
    this.obtenerViaje();
  }

  seleccionarParadaOrigen(id: number): void {
    this.mostrarMensajeError.set(false);
    this.idParadaOrigen.set(id);
  }

  seleccionarParadaDestino(id: number): void {
    this.mostrarMensajeError.set(false);
    this.idParadaDestino.set(id);
  }

  seleccionarAsiento(id: number): void {
    this.mostrarMensajeError.set(false);
    this.idAsiento.set(id);
  }

  goBack(): void {
    this.location.back();
  }

  siguientePaso() {
    if (!this.idParadaOrigen()) {
      this.mostrarMensajeError.set(true);
      this.mensajeError.set("Debe seleccionar una parada de origen");
      return;
    }

    if (!this.idParadaDestino()) {
      this.mostrarMensajeError.set(true);
      this.mensajeError.set("Debe seleccionar una parada de destino")
      return;
    }

    this.paso.set(this.paso() + 1);
    this.obtenerAsientos();
  }

  pasoAnterior(): void {
    this.paso.set(this.paso() - 1);
  }

  reservar(): void {
    if (!this.idAsiento()) {
      this.mostrarMensajeError.set(true);
      this.mensajeError.set("Debe seleccionar un asiento");
      return;
    }

    this.loading.set(true);
    const reserva: Reserva = {
      idViaje: Number(this.id!),
      idParadaOrigen: this.idParadaOrigen()!,
      idParadaDestino: this.idParadaDestino()!,
      idAsiento: this.idAsiento()!
    }

    this.reservasService.crearReserva(reserva)
      .subscribe({
        next: (reserva) => {
          this.paso.set(this.paso() + 1);
          this.reserva.set(reserva);
          this.loading.set(false)
        }, error: (error: HttpErrorResponse) => {
          this.loading.set(false);
          this.mostrarMensajeError.set(true);
          this.mensajeError.set(obtenerMensajeErrorAutenticacion(error, 'No se ha podido reservar el viaje.'));
        }
      });
  }
}
