package com.buscyl.api.dto;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonFormat;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

public record ViajeUpdateRequest(
        @NotNull(message = "El origen es obligatorio") Long idOrigen,

        @NotNull(message = "El destino es obligatorio") Long idDestino,

        @NotNull(message = "El autobús es obligatorio") Long idAutobus,

        @NotNull(message = "El conductor es obligatorio") Long idConductor,

        @JsonFormat(pattern = "yyyy-MM-dd") @NotNull(message = "La fecha es obligatoria") @Future(message = "La fecha debe ser futura") LocalDate fecha,

        @JsonFormat(pattern = "HH:mm:ss") @NotNull(message = "La hora de salida es obligatoria") LocalTime horaSalida,

        @JsonFormat(pattern = "HH:mm:ss") @NotNull(message = "La hora de llegada es obligatoria") LocalTime horaLlegada,

        @NotEmpty(message = "Las paradas son obligatorias") List<@NotNull(message = "Cada parada es obligatoria") @Valid ParadaRequest> paradas) {

}
