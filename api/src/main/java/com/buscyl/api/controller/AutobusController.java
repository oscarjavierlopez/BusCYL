package com.buscyl.api.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
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

import com.buscyl.api.dto.AutobusCreateRequest;
import com.buscyl.api.dto.AutobusResponse;
import com.buscyl.api.dto.AutobusUpdateRequest;
import com.buscyl.api.dto.AutobusesResponse;
import com.buscyl.api.dto.EmpresaResponse;
import com.buscyl.api.dto.EmpresaUpdateRequest;
import com.buscyl.api.repository.AutobusRepository;
import com.buscyl.api.service.AutobusService;

import jakarta.validation.Valid;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/autobuses")
public class AutobusController {

    @Autowired
    private AutobusService autobusService;

    @GetMapping(params = {"pagina", "matricula"})
    public ResponseEntity<AutobusesResponse> obtenerAutobusesPaginados(
        @RequestParam int pagina,
            @RequestParam String matricula
    ){
        matricula = matricula != null ? matricula.toLowerCase(): "";
        return ResponseEntity.ok(autobusService.obtenerAutobuesPaginados(pagina, matricula));
    }

    @GetMapping 
    public ResponseEntity<List<AutobusResponse>> obtenerAutobuses(){
        return ResponseEntity.ok(autobusService.obtenerAutobuses());
    }

    @GetMapping("{id}")
    public ResponseEntity<AutobusResponse> obtenerAutbus(@PathVariable Long id){
        return ResponseEntity.ok(autobusService.obtenerAutobus(id));
    }

    @PostMapping 
    public ResponseEntity<AutobusResponse> crearAutobus(@Valid @RequestBody AutobusCreateRequest request){
        return ResponseEntity.status(HttpStatus.CREATED)
        .body(autobusService.crearAutobus(request));
    }

    @PatchMapping("{id}")
    public ResponseEntity<AutobusResponse> actualizarAutobus(@PathVariable Long id, @Valid @RequestBody AutobusUpdateRequest request){
        return ResponseEntity.ok(autobusService.actualizarAutobus(id, request));
    } 

    @PatchMapping("{id}/desactivar")
    public ResponseEntity<Void> desactivarAutobus(@PathVariable Long id){
        autobusService.desactivarAutobus(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("{id}/activar")
    public ResponseEntity<Void> activarAutobus(@PathVariable Long id){
        autobusService.activarAutobus(id);
        return ResponseEntity.noContent().build();
    }


}
