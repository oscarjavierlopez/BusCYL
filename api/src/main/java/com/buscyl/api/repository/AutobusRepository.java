package com.buscyl.api.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.buscyl.api.entity.Autobus;

public interface AutobusRepository extends JpaRepository<Autobus, Long> {

    @Query(value = "SELECT * \r\n" + //
            "FROM buscyl.autobuses\r\n" + //
            "WHERE LOWER(matricula) LIKE CONCAT('%', :matricula, '%')\r\n" + //
            "AND id_empresa = :idEmpresa\r\n" + //
            "ORDER BY id\r\n" + //
            "LIMIT 20 OFFSET (:pagina - 1) * 20", nativeQuery = true)
    List<Autobus> obtenerAutobusesPaginados(@Param("pagina") int pagina, @Param("matricula") String matricula,
            @Param("idEmpresa") Long idEmpresa);

    @Query(value = "SELECT COUNT(*) \r\n" + //
            "FROM buscyl.autobuses\r\n" + //
            "WHERE LOWER(matricula) LIKE CONCAT('%', :matricula, '%')\r\n" +
            "AND id_empresa = :idEmpresa", nativeQuery = true)
    long obtenerAutobusesFiltrados(@Param("matricula") String matricula, @Param("idEmpresa") Long idEmpresa);

    @Query(value = "SELECT COUNT(*) FROM buscyl.autobuses WHERE id_empresa = :idEmpresa", nativeQuery = true)
    long obtenerTotalAutobuses(@Param("idEmpresa") Long idEmpresa);
}
