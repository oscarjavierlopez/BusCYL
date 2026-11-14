package com.buscyl.api.dto;

import lombok.Builder;

@Builder 
public record AsientoResponse(
        Long id,
        int numero,
        String tipo,
        Boolean activo) {
}
