package com.buscyl.api.service;

import com.buscyl.api.dto.ReservaRequest;
import com.buscyl.api.dto.ReservaResponse;

public interface ReservaService {
    ReservaResponse crearReserva(ReservaRequest request);

    void cancelarReserva(Long id);
}
