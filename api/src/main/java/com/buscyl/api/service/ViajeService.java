package com.buscyl.api.service;

import java.time.LocalDate;

import com.buscyl.api.dto.ViajeResponse;
import com.buscyl.api.dto.ViajesResponse;

public interface ViajeService {

    ViajesResponse obtenerViajesCoordinador(int pagina, Long idOrigen, Long idDestino, LocalDate fecha);

    ViajeResponse obtenerViaje(Long id);
}
