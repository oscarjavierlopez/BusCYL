import { HttpErrorResponse } from '@angular/common/http';

export function obtenerMensajeErrorAutenticacion(error: HttpErrorResponse, mensajePorDefecto: string): string {
  if (error.status === 429) {
    return 'No se pudo completar la acción, inténtelo de nuevo dentro de 15 minutos';
  }

  if (typeof error.error?.error === 'string') {
    return error.error.error;
  }

  if (error.error && typeof error.error === 'object') {
    const mensajeValidacion = Object.values(error.error).find((valor): valor is string => typeof valor === 'string');

    if (mensajeValidacion) {
      return mensajeValidacion;
    }
  }

  return mensajePorDefecto;
}
