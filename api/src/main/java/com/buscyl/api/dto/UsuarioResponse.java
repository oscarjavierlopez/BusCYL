package com.buscyl.api.dto;

import java.sql.Date;

import lombok.Builder;

@Builder
public record UsuarioResponse(
    Long id,
    String email,
    String rol,
    String nombre,
    String apellidos,
    String empresa,
    boolean activo
) {

}
