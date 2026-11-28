import { Asiento } from '../models/asiento';

export interface FilaAsientos {
  asientos: Asiento[];
  ultima: boolean;
}

export function organizarAsientosEnFilas(asientos: Asiento[]): FilaAsientos[] {
  const asientosPorFila = 4;
  let plazasUltimaFila = asientos.length % asientosPorFila;

  if (plazasUltimaFila === 1 && asientos.length > 5) {
    plazasUltimaFila = 5;
  }

  const plazasFilasCompletas = asientos.length - plazasUltimaFila;
  const filas: FilaAsientos[] = [];

  for (let indice = 0; indice < plazasFilasCompletas; indice += asientosPorFila) {
    filas.push({ asientos: asientos.slice(indice, indice + asientosPorFila), ultima: false });
  }

  if (plazasUltimaFila > 0) {
    filas.push({ asientos: asientos.slice(plazasFilasCompletas), ultima: true });
  }

  return filas;
}
