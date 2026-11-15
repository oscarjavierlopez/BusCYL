package com.buscyl.api.dto;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import lombok.Builder;

@Builder 
public record ViajeResponse(
    Long id,
    String origen,
    String destino,
    AutobusResponse autobus,
    ConductorResponse conductor,
    String empresa,
    LocalDate fecha,
    LocalTime horaSalida,
    LocalTime horaLLegada,
    List<ParadaResponse> paradas,
    Boolean activo 
) {

}
