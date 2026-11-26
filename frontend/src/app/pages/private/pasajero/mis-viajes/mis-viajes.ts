import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CargadorViajes } from '../../../../components/cargador-viajes/cargador-viajes';
import { ViajeCard } from '../../../../components/viaje-card/viaje-card';
import { ViajesService } from '../../../../services/viajes.service';
import { Viaje } from '../../../../models/viaje';

@Component({
  selector: 'app-mis-viajes',
  imports: [CargadorViajes, RouterLink, ViajeCard],
  templateUrl: './mis-viajes.html',
  styleUrl: './mis-viajes.css',
})
export class MisViajes implements OnInit{

  ngOnInit(): void {
    this.obtenerViajesPasajero();
  }

  private viajesService = inject(ViajesService);
  loading = signal<boolean>(false);
  viajes = signal<Viaje[]>([]);

  private obtenerViajesPasajero(): void {
    this.loading.set(true);
    this.viajesService.obtenerViajesUsuario()
      .subscribe({
        next: (response) => {
          this.viajes.set(response);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Error al obtener datos:', err);
          this.loading.set(false);
        }
      });
  }
}
