package com.buscyl.api.service;

import java.util.List;

import com.buscyl.api.dto.EmpresaCreateRequest;
import com.buscyl.api.dto.EmpresaResponse;
import com.buscyl.api.dto.EmpresaUpdateRequest;
import com.buscyl.api.dto.EmpresasResponse;

public interface EmpresaService {
    List<EmpresaResponse> obtenerEmpresas();

    EmpresasResponse obtenerEmpresasPaginadas(int pagina, String nombre, boolean activo);

    EmpresaResponse obtenerEmpresa(Long id);

    EmpresaResponse crearEmpresa(EmpresaCreateRequest request);

    EmpresaResponse actualizarEmpresa(Long id, EmpresaUpdateRequest request);

    void desactivarEmpresa(Long id);

    void activarEmpresa(Long id);
}
