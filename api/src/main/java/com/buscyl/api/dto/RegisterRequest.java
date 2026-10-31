package com.buscyl.api.dto;

import java.sql.Date;

public record RegisterRequest(String email,
        String dni,
        String nombre,
        String apellidos,
        String telefono,
        Date fechaNacimiento,
        String contrasena) {

}
