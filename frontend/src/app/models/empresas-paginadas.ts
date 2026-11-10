import { Empresa } from "./empresa";

export interface EmpresasPaginadas {
    totalEmpresas: number;
    totalPaginas: number;
    paginaPrevia: number | null;
    pagina: number;
    paginaSiguiente: number | null;
    empresas: Empresa[];
}
