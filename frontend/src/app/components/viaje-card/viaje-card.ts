import { Component, EventEmitter, Input, OnInit, Output, signal } from '@angular/core';
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
  @Output() viajeDesactivado = new EventEmitter<number>();
  @Output() viajeActivado = new EventEmitter<number>();

  ngOnInit(): void {
    this.usuario = JSON.parse(localStorage.getItem("usuario")!);
  }

  desplegado = signal(false);

  get paradasOrdenadas(): Parada[] {
    return [...this.viaje.paradas].sort((paradaA, paradaB) => paradaA.orden - paradaB.orden);
  }

  get viajeNoDisponible(): boolean {
    if (this.viaje.activo === false || !this.viaje.fecha) {
      return this.viaje.activo === false;
    }

    const fechaHoraSalida = this.crearFechaHoraSalida();

    return fechaHoraSalida !== null && fechaHoraSalida.getTime() < Date.now();
  }

  alternarParadas(): void {
    this.desplegado.update((desplegado) => !desplegado);
  }

  formatearHora(hora?: string): string {
    return hora ? hora.slice(0, 5) : '-';
  }

  private crearFechaHoraSalida(): Date | null {
    const coincidenciasFecha = /^(\d{4})-(\d{2})-(\d{2})$/.exec(this.viaje.fecha!);
    const coincidenciasHora = /^(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(this.viaje.horaSalida);

    if (!coincidenciasFecha || !coincidenciasHora) {
      return null;
    }

    const anio = Number(coincidenciasFecha[1]);
    const mes = Number(coincidenciasFecha[2]) - 1;
    const dia = Number(coincidenciasFecha[3]);
    const hora = Number(coincidenciasHora[1]);
    const minuto = Number(coincidenciasHora[2]);
    const segundo = Number(coincidenciasHora[3] ?? 0);
    const fechaHoraSalida = new Date(anio, mes, dia, hora, minuto, segundo);

    if (
      fechaHoraSalida.getFullYear() !== anio ||
      fechaHoraSalida.getMonth() !== mes ||
      fechaHoraSalida.getDate() !== dia ||
      fechaHoraSalida.getHours() !== hora ||
      fechaHoraSalida.getMinutes() !== minuto ||
      fechaHoraSalida.getSeconds() !== segundo
    ) {
      return null;
    }

    return fechaHoraSalida;
  }

  desactivarViaje(id:number):void{
    this.viajeDesactivado.emit(id);
  }

  activarViaje(id:number):void{
    this.viajeActivado.emit(id);
  }
}
