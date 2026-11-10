package com.buscyl.api.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
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

import com.buscyl.api.dto.EmpresaCreateRequest;
import com.buscyl.api.dto.EmpresaResponse;
import com.buscyl.api.dto.EmpresaUpdateRequest;
import com.buscyl.api.dto.EmpresasResponse;
import com.buscyl.api.dto.UsuariosResponse;
import com.buscyl.api.service.EmpresaService;

import jakarta.validation.Valid;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/empresas")
public class EmpresaController {

    @Autowired
    private EmpresaService empresaService;

    @GetMapping
    public ResponseEntity<List<EmpresaResponse>> obtenerEmpresas() {
        return ResponseEntity.ok(empresaService.obtenerEmpresas());
    }

    @GetMapping(params = {"pagina", "nombre", "activo"})
    public ResponseEntity<EmpresasResponse> obtenerEmpresasPaginadas(
            @RequestParam int pagina,
            @RequestParam String nombre,
            @RequestParam boolean activo) {
        nombre = nombre != null ? nombre.toLowerCase() : "";
        return ResponseEntity.ok(empresaService.obtenerEmpresasPaginadas(pagina, nombre, activo));
    }

    @GetMapping("{id}")
    public ResponseEntity<EmpresaResponse> obtenrEmpresa(@PathVariable Long id) {
        return ResponseEntity.ok(empresaService.obtenerEmpresa(id));
    }

    @PostMapping
    public ResponseEntity<EmpresaResponse> crearEmpresa(@Valid @RequestBody EmpresaCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(empresaService.crearEmpresa(request));
    }

    @PatchMapping("{id}")
    public ResponseEntity<EmpresaResponse> actualizarEmpresa(@PathVariable Long id, @Valid @RequestBody EmpresaUpdateRequest request){
        return ResponseEntity.ok(empresaService.actualizarEmpresa(id, request));
    } 

    @PatchMapping("{id}/desactivar")
    public ResponseEntity<Void> desactivarEmpresa(@PathVariable  Long id){
        empresaService.desactivarEmpresa(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("{id}/activar")
    public ResponseEntity<Void> activarEmpresa(@PathVariable  Long id){
        empresaService.activarEmpresa(id);
        return ResponseEntity.noContent().build();
    }



}
