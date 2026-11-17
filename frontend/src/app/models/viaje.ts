import { Autobus } from './autobus';

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
  paradas: unknown[];
  activo?: boolean;
  idOrigen?: number;
  idDestino?: number;
  idAutobus?: number;
  idConductor?: number;
  fechas?: string[];
  horaLlegada?: string;
}
