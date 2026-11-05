package com.buscyl.api.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.buscyl.api.entity.Usuario;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByEmail(String email);

    Optional<Usuario> findByEmailAndActivo(String email, Boolean activo);
}
