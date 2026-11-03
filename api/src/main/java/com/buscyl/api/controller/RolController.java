package com.buscyl.api.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import com.buscyl.api.dto.RolResponse;
import com.buscyl.api.service.RolService;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/roles")
public class RolController {

    @Autowired
    private RolService rolService;

    @GetMapping 
    public List<RolResponse> getRoles() {
        return rolService.getRoles();
    }
}
