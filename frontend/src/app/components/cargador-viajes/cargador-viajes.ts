import { Component, input } from '@angular/core';

@Component({
  selector: 'app-cargador-viajes',
  imports: [],
  templateUrl: './cargador-viajes.html',
  styleUrl: './cargador-viajes.css',
})
export class CargadorViajes {
  cargando = input.required<boolean>();
}
