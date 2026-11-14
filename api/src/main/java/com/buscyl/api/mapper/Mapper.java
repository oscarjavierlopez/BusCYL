package com.buscyl.api.mapper;

import java.util.List;

import com.buscyl.api.dto.AsientoResponse;
import com.buscyl.api.dto.AutobusResponse;
import com.buscyl.api.dto.EmpresaResponse;
import com.buscyl.api.dto.LocalidadResponse;
import com.buscyl.api.dto.RolResponse;
import com.buscyl.api.dto.UsuarioResponse;
import com.buscyl.api.entity.Asiento;
import com.buscyl.api.entity.Autobus;
import com.buscyl.api.entity.Empresa;
import com.buscyl.api.entity.Localidad;
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

    public static LocalidadResponse toDto(Localidad localidad){
        return LocalidadResponse.builder()
        .id(localidad.getId())
        .nombre(localidad.getNombre())
        .provincia(localidad.getProvincia().getNombre())
        .build();
    }

    public static AsientoResponse toDto(Asiento asiento){
        return AsientoResponse.builder()
        .id(asiento.getId())
        .numero(asiento.getNumero())
        .tipo(asiento.getTipo())
        .activo(asiento.getActivo())
        .build();
    }

    public static AutobusResponse toDto(Autobus autobus, boolean incluirAsientos, Long numeroAsientos, Long numeroAsientosAdaptados, Long numeroAsientosAveriados){
        List<AsientoResponse> asientos = incluirAsientos
            ? autobus.getAsientos().stream().map(Mapper::toDto).toList()
            : null;

    return AutobusResponse.builder()
            .id(autobus.getId())
            .matricula(autobus.getMatricula())
            .numeroBastidor(autobus.getNumeroBastidor())
            .numeroFlota(autobus.getNumeroFlota())
            .activo(autobus.getActivo())
            .numeroAsientos(numeroAsientos)
            .numeroAsientosAdaptados(numeroAsientosAdaptados)
            .numeroAsientosAveriados(numeroAsientosAveriados)
            .asientos(asientos)
            .build();
    }
}
