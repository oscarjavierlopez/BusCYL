package com.buscyl.api.Auth;

import com.buscyl.api.dto.UsuarioResponse;

import jakarta.validation.Valid;

public record AuthResponse(
    String token,
    Long id,
    String email,
    String nombre,
    String apellidos,
    String rol,
    long exp
) {

}
