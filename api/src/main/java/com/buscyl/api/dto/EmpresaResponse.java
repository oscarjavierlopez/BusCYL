package com.buscyl.api.dto;

import lombok.Builder;

@Builder 
public record EmpresaResponse(
    Long id,
    String nombre,
    String razonSocial,
    String cif,
    String telefono,
    String email,
    String direccion,
    String localidad,
    String provincia,
    Boolean activo
) {

}
