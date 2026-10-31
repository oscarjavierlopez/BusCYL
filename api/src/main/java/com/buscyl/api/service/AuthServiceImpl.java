package com.buscyl.api.service;

import org.springframework.beans.factory.annotation.Autowired;

import com.buscyl.api.repository.UsuarioRepository;

public class AuthServiceImpl implements AuthService {
    
    @Autowired 
    private UsuarioRepository usuarioRepository;

}
