package com.buscyl.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
    @NotBlank(message = "El email es obligatorio") 
    @Email(message = "El email no cumple un formato válido") 
    String email,

    @NotBlank(message = "La contraseña es obligatoria") 
    String contrasena
) {

}
