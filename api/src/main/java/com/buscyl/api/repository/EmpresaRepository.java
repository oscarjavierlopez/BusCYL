package com.buscyl.api.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.buscyl.api.entity.Empresa;

public interface EmpresaRepository extends JpaRepository<Empresa, Long> {
    @Query(value = "SELECT * \r\n" + //
            "FROM buscyl.empresas\r\n" + //
            "WHERE LOWER(nombre) LIKE CONCAT('%', :nombre, '%')\r\n" + //
            "AND activo = :activo\r\n" + //
            "ORDER BY id\r\n" + //
            "LIMIT 20 OFFSET (:pagina - 1) * 20", nativeQuery = true)
    List<Empresa> obtenerEmpresasPaginadas(@Param("pagina") int pagina, @Param("nombre") String nombre,
            @Param("activo") boolean activo);

    @Query(value = "SELECT COUNT(*) \r\n" + //
            "FROM buscyl.empresas\r\n" + //
            "WHERE LOWER(nombre) LIKE CONCAT('%', :nombre, '%')\r\n" + //
            "AND activo = :activo\r\n", nativeQuery = true)
    long obtenerEmpresasFiltradas(@Param("nombre") String nombre,
            @Param("activo") boolean activo);

    @Query(value = "SELECT COUNT(*) FROM buscyl.empresas", nativeQuery = true)
    long obtenerTotalEmpresas();
}
