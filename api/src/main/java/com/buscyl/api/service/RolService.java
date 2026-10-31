package com.buscyl.api.service;

import java.util.List;

import com.buscyl.api.dto.RolResponse;
import com.buscyl.api.entity.Rol;

public interface RolService {
    List<RolResponse> getRoles();

    Rol getIdRolByName(String nombre);
}
