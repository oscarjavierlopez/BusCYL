package com.buscyl.api.service;

import java.time.LocalDate;
import java.util.List;

import com.buscyl.api.dto.ViajeCreateRequest;
import com.buscyl.api.dto.ViajeResponse;
import com.buscyl.api.dto.ViajeUpdateRequest;
import com.buscyl.api.dto.ViajesResponse;

public interface ViajeService {

    ViajesResponse obtenerViajesCoordinador(int pagina, Long idOrigen, Long idDestino, LocalDate fecha);

    ViajeResponse obtenerViajeCoordinador(Long id);

    List<ViajeResponse> crearViaje( ViajeCreateRequest request);

    ViajeResponse actualizarViaje(Long id, ViajeUpdateRequest request);

    void desactivarViaje(Long id);

    void activarViaje(Long id);
}
