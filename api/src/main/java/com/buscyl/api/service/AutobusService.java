package com.buscyl.api.service;

import java.util.List;

import com.buscyl.api.dto.AutobusCreateRequest;
import com.buscyl.api.dto.AutobusResponse;
import com.buscyl.api.dto.AutobusUpdateRequest;
import com.buscyl.api.dto.AutobusesResponse;

public interface AutobusService {

    AutobusesResponse obtenerAutobuesPaginados(int pagina, String matricula);

    List<AutobusResponse> obtenerAutobuses();

    AutobusResponse obtenerAutobus(Long id);

    AutobusResponse crearAutobus(AutobusCreateRequest request);

    AutobusResponse actualizarAutobus(Long id, AutobusUpdateRequest request);

    void desactivarAutobus(Long id);

    void activarAutobus(Long id);

}
