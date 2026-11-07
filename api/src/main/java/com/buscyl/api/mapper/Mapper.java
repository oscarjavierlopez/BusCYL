package com.buscyl.api.mapper;

import com.buscyl.api.dto.EmpresaResponse;
import com.buscyl.api.dto.RolResponse;
import com.buscyl.api.dto.UsuarioResponse;
import com.buscyl.api.entity.Empresa;
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

    public static EmpresaResponse toDto(Empresa empresa){
        return EmpresaResponse.builder()
        .id(empresa.getId())
        .nombre(empresa.getNombre())
        .razonSocial(empresa.getRazonSocial())
        .cif(empresa.getCif())
        .telefono(empresa.getTelefono())
        .email(empresa.getEmail())
        .direccion(empresa.getDireccion())
        .localidad(empresa.getLocalidad().getNombre())
        .provincia(empresa.getLocalidad().getProvincia().getNombre())
        .activo(empresa.getActivo())
        .build();
    }
}
