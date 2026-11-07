package com.buscyl.api.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.buscyl.api.dto.LocalidadResponse;
import com.buscyl.api.service.LocalidadService;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/localidades")
public class LocalidadController {

    @Autowired
    private LocalidadService localidadService;

    @GetMapping
    public ResponseEntity<List<LocalidadResponse>> obtenerLocalidades() {
        return ResponseEntity.ok(localidadService.obtenerLocalidades());
    }
}
