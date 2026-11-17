import { Component, Input, signal } from '@angular/core';
import { Viaje } from '../../models/viaje';
import { Parada } from '../../models/parada';

@Component({
  selector: 'app-viaje-card',
  imports: [],
  templateUrl: './viaje-card.html',
  styleUrl: './viaje-card.css',
})
export class ViajeCard {
  @Input() viaje!: Viaje;

  desplegado = signal(false);

  get paradasOrdenadas(): Parada[] {
    return [...this.viaje.paradas].sort((paradaA, paradaB) => paradaA.orden - paradaB.orden);
  }

  alternarParadas(): void {
    this.desplegado.update((desplegado) => !desplegado);
  }

  formatearHora(hora?: string): string {
    return hora ? hora.slice(0, 5) : '-';
  }
}
