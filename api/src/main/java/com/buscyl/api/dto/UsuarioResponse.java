package com.buscyl.api.dto;

import java.time.LocalDate;

import lombok.Builder;

@Builder
public record UsuarioResponse(
    Long id,
    String email,
    String rol,
    String nombre,
    String apellidos,
    String dni,
    String telefono,
    LocalDate fechaNacimiento,
    String empresa,
    boolean activo
) {

}
