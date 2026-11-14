package com.buscyl.api.dto;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;

public record AutobusUpdateRequest(
        @Pattern(regexp = "^\\d{4}[BCDFGHJKLMNPRSTVWXYZ]{3}$", message = "La matrícula no cumple un formato válido") String matricula,

        @Pattern(regexp = "^[A-HJ-NPR-Z0-9]{17}$", message = "El número de bastidor no cumple un formato válido") String numeroBastidor,

        @Pattern(regexp = "^[A-Z0-9-]{1,20}$", message = "El número de flota no cumple un formato válido") String numeroFlota,

        List<@Valid AsientoRequest> asientos) {

}
