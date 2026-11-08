export interface Empresa {
  id?: number;
  nombre: string;
  razonSocial: string;
  cif: string;
  telefono: string;
  email: string;
  direccion: string;
  localidad: string | number;
  provincia?: string;
  activo?: boolean;
}
