import { Component, Input, OnInit, signal } from '@angular/core';
import { Viaje } from '../../models/viaje';
import { Parada } from '../../models/parada';
import { AuthResponse } from '../../models/auth-response';

@Component({
  selector: 'app-viaje-card',
  imports: [],
  templateUrl: './viaje-card.html',
  styleUrl: './viaje-card.css',
})
export class ViajeCard implements OnInit{
  @Input() viaje!: Viaje;
  usuario!: AuthResponse;

  ngOnInit(): void {
    this.usuario = JSON.parse(localStorage.getItem("usuario")!);
  }

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
