package com.buscyl.api.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public record AsientoRequest(
        @NotNull(message = "El número es obligatorio") @Min(value = 1, message = "El número debe estar comprendido entre 1 y 250") @Max(value = 250, message = "El número debe estar comprendido entre 1 y 250") Integer numero,

        @NotBlank(message = "El tipo es obligatorio") @Pattern(regexp = "^(normal|adaptado)$", message = "El tipo debe ser normal o adaptado") String tipo,

        @NotNull(message = "El estado activo es obligatorio") Boolean activo) {
}
