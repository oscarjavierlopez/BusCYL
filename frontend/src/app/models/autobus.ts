export interface Autobus {
  id?: number;
  matricula: string;
  numeroBastidor: string;
  numeroFlota: string;
  activo?: boolean;
  numeroAsientos?: number;
  numeroAsientosAdaptados?: number;
  numeroAsientosAveriados?: number;
  asientos: unknown[];
}
