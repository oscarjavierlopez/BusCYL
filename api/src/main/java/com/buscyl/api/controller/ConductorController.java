package com.buscyl.api.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.buscyl.api.dto.ConductorResponse;
import com.buscyl.api.service.UsuarioService;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/conductores")
public class ConductorController {

    @Autowired
    private UsuarioService usuarioService;

    @GetMapping 
    public ResponseEntity<List<ConductorResponse>> obtenerConductores(){
        return ResponseEntity.ok(usuarioService.obtenerConductoresEmpresa());
    }
}
