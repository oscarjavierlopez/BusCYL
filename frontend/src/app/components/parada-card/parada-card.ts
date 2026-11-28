import { Component, Input } from '@angular/core';
import { Parada } from '../../models/parada';

type tipo = 'origen' | 'destino';

@Component({
  selector: 'app-parada-card',
  imports: [],
  templateUrl: './parada-card.html',
  styleUrl: './parada-card.css',
})
export class ParadaCard {
  @Input() parada!: Parada;
  @Input() tipo!: tipo;
}
