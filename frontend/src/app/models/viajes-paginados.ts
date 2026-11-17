import { Viaje } from "./viaje";

export interface ViajesPaginados {
    totalViajes: number;
    totalPaginas: number;
    paginaPrevia: number | null;
    pagina: number;
    paginaSiguiente: number | null;
    viajes: Viaje[];
}
