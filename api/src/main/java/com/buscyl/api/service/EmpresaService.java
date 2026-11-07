package com.buscyl.api.service;

import java.util.List;

import com.buscyl.api.dto.EmpresaCreateRequest;
import com.buscyl.api.dto.EmpresaResponse;
import com.buscyl.api.dto.UsuarioUpdateRequest;

public interface EmpresaService {
    List<EmpresaResponse> obtenerEmpresas();

    EmpresaResponse obtenerEmpresa(Long id);

    EmpresaResponse crearEmpresa(EmpresaCreateRequest request);

    EmpresaResponse actualizarEmpresa(Long id, UsuarioUpdateRequest request);

    void desactivarEmpresa(Long id);

    void activarEmpresa(Long id);
}
