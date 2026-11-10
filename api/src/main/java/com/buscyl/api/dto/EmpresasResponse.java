package com.buscyl.api.dto;

import java.util.List;

import lombok.Builder;

@Builder 
public record EmpresasResponse(
        long totalEmpresas,
        int totalPaginas,
        Integer paginaPrevia,
        int pagina,
        Integer paginaSiguiente,
        List<EmpresaResponse> empresas) {

}
