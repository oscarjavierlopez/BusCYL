package com.buscyl.api.dto;

import java.sql.Date;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;

public record RegisterRequest(
                @NotBlank(message = "El email es obligatorio") @Email(message = "El email no cumple un formato válido") String email,

                @NotBlank(message = "El DNI es obligatorio") @Pattern(regexp = "^\\d{8}[a-zA-Z]$", message = "El DNI no cumple un formato válido") String dni,

                @NotBlank(message = "El nombre es obligatorio") String nombre,

                @NotBlank(message = "Los apellidos son obligatorios") String apellidos,

                @NotBlank(message = "El telefono es obligatorio") @Pattern(regexp = "^\\d{9}$", message = "El telefono no cumple un formato válido") String telefono,

                @NotBlank(message = "La fecha de nacimiento es obligatoria") @Past(message = "La fecha de nacimiento no es válida")  Date fechaNacimiento,

                @NotBlank(message = "La contraseña es obligatoria") @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=(?:.*\\d){2})(?=(?:.*[^A-Za-z0-9\\s]){2}).{8,}$", message = "La contraseña no cumple un formato válido") String contrasena) {

}
