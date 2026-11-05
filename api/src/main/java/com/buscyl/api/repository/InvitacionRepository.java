package com.buscyl.api.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.buscyl.api.entity.Invitacion;

public interface InvitacionRepository extends JpaRepository<Invitacion, Long> {
    @Query(value = "SELECT token FROM buscyl.invitaciones WHERE id_usuario = (SELECT id FROM buscyl.usuarios WHERE email = :email) AND fecha_expiracion >= NOW() AND fecha_uso IS NULL", nativeQuery = true)
    Optional<String> obtenerTokenUsuario(@Param("email") String email);

    @Query(value = "SELECT * FROM buscyl.invitaciones WHERE token = :token AND fecha_expiracion >= NOW() AND fecha_uso IS NULL", nativeQuery = true)
    Optional<Invitacion> obtenerInvitacion(@Param("token") String token);
}
