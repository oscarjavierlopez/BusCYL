package com.buscyl.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public record EmpresaCreateRequest(
        @NotBlank(message = "El nombre es obligatorio") String nombre,

        @NotBlank(message = "La razón social es obligatoria") @Pattern(regexp = "^[\\p{L}\\d][\\p{L}\\d .,'&()/-]{1,149}$", message = "La razón social no cumple un formato válido") String razonSocial,

        @NotBlank(message = "El CIF es obligatorio") @Pattern(regexp = "^[A-HJ-NP-SUVW]\\d{7}[0-9A-J]$", message = "El CIF no cumple un formato válido") String cif,

        @NotBlank(message = "El teléfono es obligatorio") String telefono,

        @NotBlank(message = "El email es obligatorio") @Email(message = "El email no cumple un formato válido") String email,

        @NotBlank(message = "La dirección es obligatoria") String direccion,

        @NotNull(message = "La localidad es obligatoria") Long localidad,

        @NotNull(message = "El estado activo es obligatorio") Boolean activo) {

}
