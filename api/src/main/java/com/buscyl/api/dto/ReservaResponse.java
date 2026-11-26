package com.buscyl.api.dto;

import java.time.LocalDate;

import lombok.Builder;

@Builder 
public record ReservaResponse(
    Long id,
    String pasajero,
    Long viaje,
    String origen,
    String destino,
    String estado,
    LocalDate fechaReserva,
    String token
) {

}
