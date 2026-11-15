package com.buscyl.api.dto;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonFormat;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;

@Builder 
public record ViajeCreateRequest(
    @NotNull(message = "El origen es obligatorio") Long idOrigen,

    @NotNull(message = "El destino es obligatorio") Long idDestino,

    @NotNull(message = "El autobús es obligatorio") Long idAutobus,

    @NotNull(message = "El conductor es obligatorio") Long idConductor,

    @JsonFormat(pattern = "yyyy-MM-dd")
    @NotEmpty(message = "Las fechas son obligatorias") List<@NotNull(message = "Cada fecha es obligatoria") @Future(message = "Las fechas deben ser futuras") LocalDate> fechas,

    @JsonFormat(pattern = "HH:mm:ss")
    @NotNull(message = "La hora de salida es obligatoria") LocalTime horaSalida,

    @JsonFormat(pattern = "HH:mm:ss")
    @NotNull(message = "La hora de llegada es obligatoria") LocalTime horaLlegada,

    @NotEmpty(message = "Las paradas son obligatorias") List<@NotNull(message = "Cada parada es obligatoria") @Valid ParadaRequest> paradas
) {

}
