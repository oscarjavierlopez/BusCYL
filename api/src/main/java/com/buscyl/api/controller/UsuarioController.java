package com.buscyl.api.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.buscyl.api.dto.UsuariosResponse;
import com.buscyl.api.service.UsuarioService;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/usuarios")
public class UsuarioController {

    @Autowired
    private UsuarioService usuarioService;

    @GetMapping
    public ResponseEntity<UsuariosResponse> obtenerUsuarios(
            @RequestParam int pagina,
            @RequestParam String nombreApellidos,
            @RequestParam boolean activo) {
        nombreApellidos = nombreApellidos != null ? nombreApellidos.toLowerCase() : "";
        return ResponseEntity.ok(usuarioService.getUsuarios(pagina, nombreApellidos, activo));
    }

}
