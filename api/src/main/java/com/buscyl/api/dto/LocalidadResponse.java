package com.buscyl.api.dto;

import lombok.Builder;

@Builder 
public record LocalidadResponse(
    Long id,
    String nombre,
    String provincia
) {

}
