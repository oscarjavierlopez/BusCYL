export interface Parada {
  id?: number;
  localidad?: string;
  horaLlegada: string;
  horaSalida: string;
  direccion: string;
  orden: number;
  idLocalidad?: number;
}
