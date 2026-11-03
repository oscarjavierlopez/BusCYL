package com.buscyl.api.Auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record ForgotPasswordRequest(
        @NotBlank(message = "El email es obligatorio") @Email(message = "El email no cumple un formato válido") String email) {

}
