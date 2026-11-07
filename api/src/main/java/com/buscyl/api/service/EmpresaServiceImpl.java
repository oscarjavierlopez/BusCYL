package com.buscyl.api.service;

import org.springframework.beans.factory.annotation.Autowired;

import com.buscyl.api.repository.EmpresaRepository;

public class EmpresaServiceImpl implements EmpresaService{

    @Autowired 
    private EmpresaRepository empresaRepository;

}
