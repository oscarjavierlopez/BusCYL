package com.buscyl.api.dto;

import lombok.Builder;

@Builder 
public record ConductorResponse(
    Long id,
    String email,
    String nombre,
    String apellidos,
    String empresa
) {

}
