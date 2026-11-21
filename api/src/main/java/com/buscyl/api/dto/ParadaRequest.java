package com.buscyl.api.dto;

import java.time.LocalTime;

import com.fasterxml.jackson.annotation.JsonFormat;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Builder;

@Builder
public record ParadaRequest(
        @NotNull(message = "La localidad es obligatoria") Long idLocalidad,

        @JsonFormat(pattern = "HH:mm:ss") @NotNull(message = "La hora de llegada es obligatoria") LocalTime horaLlegada,

        @JsonFormat(pattern = "HH:mm:ss") LocalTime horaSalida,

        @NotBlank(message = "La dirección es obligatoria") String direccion,

        @NotNull(message = "El orden es obligatorio") @Positive(message = "El orden debe ser mayor que 0") Integer orden) {

}
