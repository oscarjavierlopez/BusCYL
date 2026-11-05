package com.buscyl.api.Auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record ResetPasswordRequest(
        @NotBlank(message = "El token es obligatorio") String token,
        @NotBlank(message = "La contraseña es obligatoria") @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=(?:.*\\d){2})(?=(?:.*[^A-Za-z0-9\\s]){2}).{8,}$", message = "La contraseña no cumple un formato válido") String contrasena) {

}
