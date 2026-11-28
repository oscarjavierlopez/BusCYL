import { Component, computed, inject, Input, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthService } from '../../../../services/auth.service';
import { ViajesService } from '../../../../services/viajes.service';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { NgxSonnerToaster, toast } from 'ngx-sonner';
import { Viaje as ViajeModel } from '../../../../models/viaje';
import { CargadorViajes } from '../../../../components/cargador-viajes/cargador-viajes';
import { ReservasService } from '../../../../services/reservas.service';
import { Location } from '@angular/common';

declare const Swal: {
  fire: (options: {
    title: string;
    icon: 'question';
    showCancelButton: boolean;
    confirmButtonText: string;
    cancelButtonText: string;
    confirmButtonColor: string;
  }) => Promise<{ isConfirmed: boolean }>;
};

@Component({
  selector: 'app-viaje',
  imports: [CargadorViajes, NgxSonnerToaster, RouterLink],
  templateUrl: './viaje.html',
  styleUrl: './viaje.css',
})
export class Viaje implements OnInit {
  private viajeService = inject(ViajesService);
  private reservasService = inject(ReservasService);
  private router = inject(Router);
  private location = inject(Location);

  @Input() id!: string;
  viaje = signal<ViajeModel | null>(null);
  loading = signal<boolean>(false);
  pasajero = toSignal(inject(AuthService).UserData);
  paradasOrdenadas = computed(() =>
    [...(this.viaje()?.paradas ?? [])].sort((a, b) => a.orden - b.orden)
  );
  fechaBillete = computed(() => {
    const fecha = this.viaje()?.fecha;
    if (!fecha) return '';
    return new Intl.DateTimeFormat('es-ES', { dateStyle: 'full', timeZone: 'UTC' })
      .format(new Date(fecha));
  });

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

  private confirmarCambioEstado(mensaje: string, colorConfirmacion: string, accion: () => void): void {
    Swal.fire({
      title: mensaje,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: colorConfirmacion,
    }).then((result) => {
      if (result.isConfirmed) {
        accion();
      }
    });
  }

  cancelarReserva() {
    let idReserva: number = this.viaje()?.reserva!;
    this.confirmarCambioEstado(`¿Desea cancelar su viaje?`, '#a6001c', () => {
      this.reservasService.cancelarReserva(idReserva).subscribe({
        next: () => {
          toast.success("Reserva cancelada");
          setTimeout(() => {
            this.location.back();
          }, 1000);
        }
      })
    })
  }
}
