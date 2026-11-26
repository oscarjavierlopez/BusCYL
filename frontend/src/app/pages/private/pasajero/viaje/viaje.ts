import { Component, inject, Input, OnInit, signal } from '@angular/core';
import { ViajesService } from '../../../../services/viajes.service';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { NgxSonnerToaster, toast } from 'ngx-sonner';
import { Viaje as ViajeModel } from '../../../../models/viaje';
import { Parada } from '../../../../models/parada';
import { CargadorViajes } from '../../../../components/cargador-viajes/cargador-viajes';

@Component({
  selector: 'app-viaje',
  imports: [CargadorViajes, NgxSonnerToaster],
  templateUrl: './viaje.html',
  styleUrl: './viaje.css',
})
export class Viaje implements OnInit {
  private viajeService = inject(ViajesService);
  private router = inject(Router);

  @Input() id!: string;
  viaje = signal<ViajeModel | null>(null);
  loading = signal<boolean>(false);

  ngOnInit(): void {
    this.loading.set(true);

    this.viajeService.obtenerViajeUsuario(Number(this.id))
      .subscribe({
        next: (viaje) => {
          this.viaje.set(viaje);
          this.loading.set(false);
        },
        error: (error: HttpErrorResponse) => {
          this.loading.set(false);

          if (error.status === 404 || error.status === 403) {
            this.router.navigate(['/private/viajes/pasajero/buscar']).then(() => {
              toast.error('viaje no encontrado');
            });
          }
        }
      });
  }

  obtenerParadasOrdenadas(paradas?: Parada[]): Parada[] {
    return [...(paradas ?? [])].sort((paradaA, paradaB) => paradaA.orden - paradaB.orden);
  }

  formatearHora(hora?: string | null): string {
    return hora ? hora.slice(0, 5) : '-';
  }

  obtenerDuracion(viaje: ViajeModel): string {
    const minutosSalida = this.obtenerMinutos(viaje.horaSalida);
    const minutosLlegada = this.obtenerMinutos(viaje.horaLLegada ?? viaje.horaLlegada);

    if (minutosSalida === null || minutosLlegada === null) {
      return '-';
    }

    let duracionMinutos = minutosLlegada - minutosSalida;

    if (duracionMinutos < 0) {
      duracionMinutos += 24 * 60;
    }

    const horas = Math.floor(duracionMinutos / 60);
    const minutos = duracionMinutos % 60;

    if (horas === 0) {
      return `${minutos} min`;
    }

    return minutos === 0 ? `${horas} h` : `${horas} h ${minutos} min`;
  }

  private obtenerMinutos(hora?: string): number | null {
    const coincidencias = /^(\d{2}):(\d{2})(?::\d{2})?$/.exec(hora ?? '');

    if (!coincidencias) {
      return null;
    }

    const horas = Number(coincidencias[1]);
    const minutos = Number(coincidencias[2]);

    if (horas > 23 || minutos > 59) {
      return null;
    }

    return horas * 60 + minutos;
  }
}
