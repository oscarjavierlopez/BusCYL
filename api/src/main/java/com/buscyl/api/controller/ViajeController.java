package com.buscyl.api.controller;

import java.time.LocalDate;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.buscyl.api.dto.ViajesResponse;
import com.buscyl.api.service.ViajeService;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/viajes")
public class ViajeController {

    @Autowired 
    private ViajeService viajeService;

    @GetMapping(params = {"pagina", "idOrigen", "idDestino", "fecha"})
    public ResponseEntity<ViajesResponse> obtenerViajesCoordinador(
        @RequestParam int pagina,
        @RequestParam Long idOrigen,
        @RequestParam Long idDestino,
        @RequestParam LocalDate fecha
    ){
        return ResponseEntity.ok(viajeService.obtenerViajesCoordinador(pagina, idOrigen, idDestino, fecha));
    }

}
