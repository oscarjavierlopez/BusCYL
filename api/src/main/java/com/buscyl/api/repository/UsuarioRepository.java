package com.buscyl.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.buscyl.api.entity.Usuario;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

}
