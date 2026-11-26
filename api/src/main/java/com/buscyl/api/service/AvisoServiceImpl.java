package com.buscyl.api.service;

import java.time.LocalDate;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cglib.core.Local;
import org.springframework.stereotype.Service;

import com.buscyl.api.entity.Aviso;
import com.buscyl.api.entity.Usuario;
import com.buscyl.api.repository.AvisoRepository;

@Service
public class AvisoServiceImpl implements AvisoService {

    @Autowired
    private AvisoRepository avisoRepository;

    @Override
    public Aviso crearAviso(Usuario usuario, String motivo) {
        Aviso aviso = Aviso.builder()
                .usuario(usuario)
                .motivo(motivo)
                .fechaAviso(LocalDate.now())
                .build();

        return avisoRepository.save(aviso);
    }
}
