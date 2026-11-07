package com.buscyl.api.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.buscyl.api.dto.LocalidadResponse;
import com.buscyl.api.mapper.Mapper;
import com.buscyl.api.repository.LocalidadRepository;

@Service 
public class LocalidadServiceImpl implements LocalidadService{

    @Autowired 
    private LocalidadRepository localidadRepository;

    @Override
    public List<LocalidadResponse> obtenerLocalidades() {
        return localidadRepository.findAll()
        .stream()
        .map(Mapper::toDto)
        .toList();
    }

}
