package com.buscyl.api.dto;

import java.time.LocalTime;

import com.fasterxml.jackson.annotation.JsonInclude;

import lombok.Builder;

@Builder 
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ParadaResponse(
    Long id,
    String localidad,
    LocalTime horaLlegada,
    LocalTime horaSalida,
    String direccion,
    int orden
) {

}
