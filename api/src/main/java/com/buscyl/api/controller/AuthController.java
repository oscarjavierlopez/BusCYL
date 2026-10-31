package com.buscyl.api.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RestController;

import com.buscyl.api.service.AuthService;

@RestController("/auth")
public class AuthController {

    @Autowired 
    private AuthService authService;
}
