import { Autobus } from './autobus';
import { Conductor } from './conductor';
import { Parada } from './parada';

export interface Viaje {
  id?: number;
  origen?: string;
  destino?: string;
  autobus?: Autobus;
  empresa?: string;
  fecha?: string;
  horaSalida: string;
  horaLLegada?: string;
  paradas?: Parada[];
  activo?: boolean;
  idOrigen?: number;
  idDestino?: number;
  idAutobus?: number;
  idConductor?: number;
  conductor?: Conductor;
  fechas?: string[];
  horaLlegada?: string;
  asiento?: number;
  reserva?: number;
}
