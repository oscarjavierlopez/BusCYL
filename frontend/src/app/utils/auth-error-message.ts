import { HttpErrorResponse } from '@angular/common/http';

export function obtenerMensajeErrorAutenticacion(error: HttpErrorResponse, mensajePorDefecto: string): string {
  if (error.status === 429) {
    return 'No se pudo completar la acción, inténtelo de nuevo dentro de 15 minutos';
  }

  return typeof error.error?.error === 'string' ? error.error.error : mensajePorDefecto;
}
