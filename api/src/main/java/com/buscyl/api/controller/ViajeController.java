package com.buscyl.api.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.repository.query.Param;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.buscyl.api.dto.AsientoResponse;
import com.buscyl.api.dto.ViajeCreateRequest;
import com.buscyl.api.dto.ViajeResponse;
import com.buscyl.api.dto.ViajeUpdateRequest;
import com.buscyl.api.dto.ViajesResponse;
import com.buscyl.api.service.ViajeService;

import jakarta.validation.Valid;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/viajes")
public class ViajeController {

    @Autowired
    private ViajeService viajeService;

    @GetMapping(params = { "pagina", "idOrigen", "idDestino", "fecha" })
    public ResponseEntity<ViajesResponse> obtenerViajes(
            @RequestParam int pagina,
            @RequestParam Long idOrigen,
            @RequestParam Long idDestino,
            @RequestParam LocalDate fecha) {
        return ResponseEntity.ok(viajeService.obtenerViajes(pagina, idOrigen, idDestino, fecha));
    }

    @GetMapping("{id}")
    public ResponseEntity<ViajeResponse> obtenerViaje(@PathVariable Long id,
        @RequestParam(required = false) Long idOrigen,
        @RequestParam(required = false) Long idDestino
    ) {
        return ResponseEntity.ok(viajeService.obtenerViaje(id,  idOrigen, idDestino));
    }

    @GetMapping("/me")
    public ResponseEntity<List<ViajeResponse>> obtenerViajesUsuario(){
        return ResponseEntity.ok(viajeService.obtenerViajesUsuario());
    }

    @GetMapping("/me/{id}")
    public ResponseEntity<ViajeResponse> obtenerViajeUsuario(@PathVariable Long id){
        return ResponseEntity.ok(viajeService.obtenerViajeUsuario(id));
    }


    @GetMapping("/{id}/asientos")
    public ResponseEntity<List<AsientoResponse>> obtenerAsientosViaje(
        @PathVariable Long id,
            @RequestParam Long idParadaOrigen,
            @RequestParam Long idParadaDestino
    ){
        return ResponseEntity.ok(viajeService.obtenerAsientosViaje(id, idParadaOrigen, idParadaDestino));
    }

    @PostMapping
    public ResponseEntity<List<ViajeResponse>> crearViaje(@Valid @RequestBody ViajeCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(viajeService.crearViaje(request));
    }

    @PatchMapping("{id}")
    public ResponseEntity<ViajeResponse> actualizarViaje(@PathVariable Long id, @Valid @RequestBody ViajeUpdateRequest request){
        return ResponseEntity.ok(viajeService.actualizarViaje(id, request));
    }

    @PatchMapping("{id}/desactivar")
    public ResponseEntity<Void> desactivarViaje(@PathVariable Long id){
        viajeService.desactivarViaje(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("{id}/activar")
    public ResponseEntity<Void> activarViaje(@PathVariable Long id){
        viajeService.activarViaje(id);
        return ResponseEntity.noContent().build();
    }
}
