package com.buscyl.api.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.buscyl.api.entity.Rol;

public interface RolRepository extends JpaRepository<Rol, Long>{
    Optional<Rol> findByNombre(String nombre);
}
