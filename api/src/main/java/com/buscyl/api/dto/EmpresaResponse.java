package com.buscyl.api.dto;

public record EmpresaResponse(
    Long id,
    String nombre,
    String razonSocial,
    String cif,
    String telefono,
    String email,
    String direccion,
    String localidad,
    Boolean activo
) {

}
