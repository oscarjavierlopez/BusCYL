package com.buscyl.api.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.buscyl.api.dto.RolResponse;
import com.buscyl.api.repository.RolRepository;

@Service
public class RolServiceImpl implements RolService {

    @Autowired
    private RolRepository rolRepository;

    @Override
    public List<RolResponse> getRoles() {
        return rolRepository.findAll()
                .stream()
                .map(rol -> new RolResponse(
                        rol.getId(),
                        rol.getNombre()))
                .toList();
    }

}
