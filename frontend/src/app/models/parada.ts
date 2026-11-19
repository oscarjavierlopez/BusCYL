export interface Parada {
  id?: number;
  localidad?: string;
  horaLlegada: string;
  horaSalida: string | null;
  direccion: string;
  orden: number;
  idLocalidad?: number;
}
