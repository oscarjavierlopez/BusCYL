package com.buscyl.api.Auth;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;


@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor 
public class AuthController {

    @Autowired 
    private AuthService authService;

    @PostMapping("/login")
    public String login(@RequestBody String entity) {
        //TODO: process POST request
        
        return entity;
    }
    
    @PostMapping("/register")
    public String register(@RequestBody String entity) {
        //TODO: process POST request
        
        return entity;
    }
    
}
