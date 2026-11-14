package com.buscyl.api.dto;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;

public record AutobusCreateRequest(
        @NotBlank(message = "La matrícula es obligatoria") @Pattern(regexp = "^\\d{4}[BCDFGHJKLMNPRSTVWXYZ]{3}$", message = "La matrícula no cumple un formato válido") String matricula,

        @NotBlank(message = "El número de bastidor es obligatorio") @Pattern(regexp = "^[A-HJ-NPR-Z0-9]{17}$", message = "El número de bastidor no cumple un formato válido") String numeroBastidor,

        @NotBlank(message = "El número de flota es obligatorio") @Pattern(regexp = "^[A-Z0-9-]{1,20}$", message = "El número de flota no cumple un formato válido") String numeroFlota,

        @NotEmpty(message = "Los asientos son obligatorios") List<@Valid AsientoRequest> asientos) {

}
