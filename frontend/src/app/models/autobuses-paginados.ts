import { Autobus } from "./autobus";

export interface AutobusesPaginados {
    totalAutobuses: number;
    totalPaginas: number;
    paginaPrevia: number | null;
    pagina: number;
    paginaSiguiente: number | null;
    autobuses: Autobus[];
}
