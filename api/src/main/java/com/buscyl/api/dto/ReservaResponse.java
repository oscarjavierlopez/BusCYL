package com.buscyl.api.dto;

import java.time.LocalDate;

public record ReservaResponse(
    Long id,
    String pasajero,
    Long viaje,
    String origen,
    String Destino,
    String estado,
    LocalDate fechaReserva,
    String codigoQR
) {

}
