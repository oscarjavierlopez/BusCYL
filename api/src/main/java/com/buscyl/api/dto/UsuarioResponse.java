package com.buscyl.api.dto;

import java.sql.Date;

public record UsuarioResponse(
    Long id,
    String email,
    String rol,
    String nombre,
    String apellidos,
    String dni,
    String telefono,
    Date fechaNacimiento,
    Date fecha_registro,
    String empresa,
    boolean activo
) {

}
