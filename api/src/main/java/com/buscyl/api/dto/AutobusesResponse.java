package com.buscyl.api.dto;

import java.util.List;

import lombok.Builder;

@Builder 
public record AutobusesResponse(
        long totalAutobuses,
        int totalPaginas,
        Integer paginaPrevia,
        int pagina,
        Integer paginaSiguiente,
        List<AutobusResponse> autobuses) {

}
