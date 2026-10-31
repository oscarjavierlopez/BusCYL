package com.buscyl.api.Auth;

import org.springframework.beans.factory.annotation.Autowired;

import com.buscyl.api.repository.UsuarioRepository;

public class AuthServiceImpl implements AuthService {
    
    @Autowired 
    private UsuarioRepository usuarioRepository;

}
