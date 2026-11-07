package com.buscyl.api.mapper;

import com.buscyl.api.dto.RolResponse;
import com.buscyl.api.dto.UsuarioResponse;
import com.buscyl.api.entity.Rol;
import com.buscyl.api.entity.Usuario;

public class Mapper {
    public static RolResponse toDTO(Rol rol) {
        return new RolResponse(rol.getId(),
                rol.getNombre());
    }

    public static UsuarioResponse toDto(Usuario usuario){
        return UsuarioResponse.builder()
        .id(usuario.getId())
        .email(usuario.getEmail())
        .rol(usuario.getRol().getNombre())
        .nombre(usuario.getNombre())
        .apellidos(usuario.getApellidos())
        .dni(usuario.getDni())
        .telefono(usuario.getTelefono())
        .fechaNacimiento(usuario.getFechaNacimiento())
        .empresa(usuario.getEmpresa() != null ? usuario.getEmpresa().getNombre() : null)
        .activo(usuario.getActivo())
        .build();
    }
}
