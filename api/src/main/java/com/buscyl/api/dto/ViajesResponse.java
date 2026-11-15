package com.buscyl.api.dto;

import java.util.List;

import lombok.Builder;

@Builder
public record ViajesResponse(
        long totalViajes,
        int totalPaginas,
        Integer paginaPrevia,
        int pagina,
        Integer paginaSiguiente,
        List<ViajeResponse> viajes) {

}
