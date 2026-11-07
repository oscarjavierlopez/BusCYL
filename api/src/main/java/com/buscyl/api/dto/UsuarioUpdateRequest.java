package com.buscyl.api.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;

public record UsuarioUpdateRequest(
        @Email(message = "El email no cumple un formato válido") String email,

        Long rol,

        @Pattern(regexp = "^\\d{8}[a-zA-Z]$", message = "El DNI no cumple un formato válido") String dni,

        String nombre,

        String apellidos,

        @Pattern(regexp = "^\\d{9}$", message = "El telefono no cumple un formato válido") String telefono,

        @Past(message = "La fecha de nacimiento no es válida") LocalDate fechaNacimiento,

        Long empresa) {

}
