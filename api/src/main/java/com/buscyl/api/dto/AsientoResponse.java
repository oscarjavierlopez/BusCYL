package com.buscyl.api.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

import lombok.Builder;

@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public record AsientoResponse(
                Long id,
                int numero,
                String tipo,
                Boolean activo,
                Boolean reservado) {
}
