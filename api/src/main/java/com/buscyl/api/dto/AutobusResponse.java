package com.buscyl.api.dto;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonInclude;

import lombok.Builder;

@Builder 
@JsonInclude(JsonInclude.Include.NON_NULL)
public record AutobusResponse(
        Long id,
        String matricula,
        String numeroBastidor,
        String numeroFlota,
        Boolean activo,
        Long numeroAsientos,
        Long numeroAsientosAdaptados,
        Long numeroAsientosAveriados,
        List<AsientoResponse> asientos) {

}
