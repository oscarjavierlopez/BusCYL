package com.buscyl.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.buscyl.api.entity.Empresa;

public interface EmpresaRepository extends JpaRepository<Empresa, Long>{
}
