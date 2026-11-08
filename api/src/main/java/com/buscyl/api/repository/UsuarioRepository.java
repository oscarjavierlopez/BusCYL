package com.buscyl.api.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.buscyl.api.entity.Usuario;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
        Optional<Usuario> findByEmail(String email);

        Optional<Usuario> findByEmailAndActivo(String email, Boolean activo);

        @Query(value = "SELECT * \r\n" + //
                        "FROM buscyl.usuarios\r\n" + //
                        "WHERE CONCAT(LOWER(nombre), '', LOWER(apellidos)) LIKE CONCAT('%', :nombreApellidos, '%')\r\n" + //
                        "AND activo = :activo\r\n" + //
                        "ORDER BY id\r\n" + //
                        "LIMIT 20 OFFSET (:pagina - 1) * 20", nativeQuery = true)
        List<Usuario> obtenerUsuarios(@Param("pagina") int pagina, @Param("nombreApellidos") String nombreApellidos,
                        @Param("activo") boolean activo);

        @Query(value = "SELECT COUNT(*) FROM buscyl.usuarios \r\n" + //
                        "WHERE CONCAT(LOWER(nombre), '', LOWER(apellidos)) LIKE CONCAT('%', :nombreApellidos, '%')\r\n" + //
                        "AND activo = :activo\r\n", nativeQuery = true)
        long obtenerUsuariosFiltrados(@Param("nombreApellidos") String nombreApellidos,
                        @Param("activo") boolean activo);

        @Query(value = "SELECT COUNT(*) FROM buscyl.usuarios", nativeQuery = true)
        long obtenerTotalUsuarios();
}
