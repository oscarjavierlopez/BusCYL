package com.buscyl.api.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.buscyl.api.dto.EmpresaCreateRequest;
import com.buscyl.api.dto.EmpresaResponse;
import com.buscyl.api.dto.EmpresaUpdateRequest;
import com.buscyl.api.dto.UsuarioUpdateRequest;
import com.buscyl.api.entity.Empresa;
import com.buscyl.api.entity.Localidad;
import com.buscyl.api.exception.NotFoundException;
import com.buscyl.api.mapper.Mapper;
import com.buscyl.api.repository.EmpresaRepository;
import com.buscyl.api.repository.LocalidadRepository;

@Service
public class EmpresaServiceImpl implements EmpresaService {

    @Autowired
    private EmpresaRepository empresaRepository;

    @Autowired
    private LocalidadRepository localidadRepository;

    @Override
    public List<EmpresaResponse> obtenerEmpresas() {
        return empresaRepository.findAll()
                .stream()
                .map(Mapper::toDto)
                .toList();
    }

    @Override
    public EmpresaResponse obtenerEmpresa(Long id) {
        Empresa empresa = empresaRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Empresa no encontrada"));

        return Mapper.toDto(empresa);
    }

    @Override
    public EmpresaResponse crearEmpresa(EmpresaCreateRequest request) {
        Localidad localidad = localidadRepository.findById(request.localidad())
                .orElseThrow(() -> new NotFoundException("Localidad no válida"));

        Empresa nuevaEmpresa = Empresa.builder()
                .nombre(request.nombre())
                .razonSocial(request.razonSocial())
                .cif(request.cif())
                .telefono(request.telefono())
                .email(request.email())
                .direccion(request.direccion())
                .localidad(localidad)
                .activo(true)
                .build();

        return Mapper.toDto(empresaRepository.save(nuevaEmpresa));

    }

    @Override
    public EmpresaResponse actualizarEmpresa(Long id, EmpresaUpdateRequest request) {
        Empresa empresaActualizar = empresaRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Empresa no encontrada"));

        if (request.nombre() != null) {
            empresaActualizar.setNombre(request.nombre());
        }

        if (request.razonSocial() != null) {
            empresaActualizar.setRazonSocial(request.razonSocial());
        }

        if (request.cif() != null) {
            empresaActualizar.setCif(request.cif());
        }

        if (request.telefono() != null) {
            empresaActualizar.setTelefono(request.telefono());
        }

        if (request.email() != null) {
            empresaActualizar.setEmail(request.email());
        }

        if (request.direccion() != null) {
            empresaActualizar.setDireccion(request.direccion());
        }

        if (request.localidad() != null) {
            Localidad localidad = localidadRepository.findById(request.localidad())
                    .orElseThrow(() -> new NotFoundException("Localidad no válida"));
            empresaActualizar.setLocalidad(localidad);
        }

        return Mapper.toDto(empresaRepository.save(empresaActualizar));
        ;
    }

    @Override
    public void desactivarEmpresa(Long id) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'desactivarEmpresa'");
    }

    @Override
    public void activarEmpresa(Long id) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'activarEmpresa'");
    }

}
