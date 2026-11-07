package com.buscyl.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;

public record EmpresaUpdateRequest(
        String nombre,

        @Pattern(regexp = "^[\\p{L}\\d][\\p{L}\\d .,'&()/-]{1,149}$", message = "La razón social no cumple un formato válido") String razonSocial,

        @Pattern(regexp = "^[A-HJ-NP-SUVW]\\d{7}[0-9A-J]$", message = "El CIF no cumple un formato válido") String cif,

        String telefono,

        @Email(message = "El email no cumple un formato válido") String email,

        String direccion,

        Long localidad,

        Boolean activo) {

}
