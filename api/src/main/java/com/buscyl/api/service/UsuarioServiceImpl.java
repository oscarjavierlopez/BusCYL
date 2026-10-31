package com.buscyl.api.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.buscyl.api.repository.UsuarioRepository;

@Service 
public class UsuarioServiceImpl implements UsuarioService{
    
    @Autowired 
    private UsuarioRepository usuarioRepository;

    
}
