package com.buscyl.api.dto;

import java.util.List;

import lombok.Builder;

@Builder
public record UsuariosResponse(
        long totalUsuarios,
        int totalPaginas,
        Integer paginaPrevia,
        int pagina,
        Integer paginaSiguiente,
        List<UsuarioResponse> usuarios) {

}
