package com.buscyl.api.mapper;

import com.buscyl.api.dto.RolResponse;
import com.buscyl.api.entity.Rol;

public class Mapper {
    public static RolResponse toDTO(Rol rol) {
        return new RolResponse(rol.getId(),
                rol.getNombre());
    }
}
