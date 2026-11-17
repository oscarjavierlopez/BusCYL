import { Autobus } from './autobus';
import { Parada } from './parada';

export interface Viaje {
  id?: number;
  origen?: string;
  destino?: string;
  autobus?: Autobus;
  conductor?: unknown;
  empresa?: string;
  fecha?: string;
  horaSalida: string;
  horaLLegada?: string;
  paradas: Parada[];
  activo?: boolean;
  idOrigen?: number;
  idDestino?: number;
  idAutobus?: number;
  idConductor?: number;
  fechas?: string[];
  horaLlegada?: string;
}
