package com.buscyl.api.dto;

import java.time.LocalTime;

import lombok.Builder;

@Builder 
public record ParadaResponse(
    Long id,
    String localidad,
    LocalTime horaLlegada,
    LocalTime horaSalida,
    String direccion,
    int orden
) {

}
