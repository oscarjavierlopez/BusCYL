package com.buscyl.api.dto;

import jakarta.validation.constraints.NotNull;

public record ReservaRequest(
        @NotNull(message = "El viaje es obligatorio") Long idViaje,
        @NotNull(message = "El asiento es obligatorio") Long idAsiento,
        @NotNull(message = "El origen es obligatorio") Long idParadaOrigen,
        @NotNull(message = "El destino es obligatorio") Long idParadaDestino) {
}
