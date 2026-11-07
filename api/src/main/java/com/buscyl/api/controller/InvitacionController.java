package com.buscyl.api.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.buscyl.api.Auth.ForgotPasswordRequest;
import com.buscyl.api.Auth.ForgotPasswordResponse;
import com.buscyl.api.service.InvitacionService;

import jakarta.validation.Valid;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/invitaciones")
public class InvitacionController {

    @Autowired 
    private InvitacionService invitacionService;

    @PostMapping
    public ResponseEntity<ForgotPasswordResponse> enviarInvitacion(@Valid @RequestBody ForgotPasswordRequest request){
        return ResponseEntity.ok(invitacionService.enviarInvitacion(request));
    }

}
