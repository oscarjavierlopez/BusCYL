import { Usuario } from './usuario';

export interface UsuariosPaginados {
  totalUsuarios: number;
  totalPaginas: number;
  paginaPrevia: number | null;
  pagina: number;
  paginaSiguiente: number | null;
  usuarios: Usuario[];
}
