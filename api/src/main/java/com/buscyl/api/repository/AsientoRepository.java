package com.buscyl.api.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.buscyl.api.entity.Asiento;

public interface AsientoRepository extends JpaRepository<Asiento, Long>{

    @Query(value = "SELECT COUNT(*)\r\n" + //
            "FROM buscyl.asientos\r\n" + //
            "WHERE id_autobus = :idAutobus\r\n", nativeQuery = true)
    Long obtenerTotalAsientos(@Param("idAutobus") Long idAutobus);

    @Query(value = "SELECT COUNT(*)\r\n" + //
            "FROM buscyl.asientos\r\n" + //
            "WHERE id_autobus = :idAutobus AND tipo = 'adaptado'\r\n", nativeQuery = true)
    Long obtenerAsientosAdaptados(@Param("idAutobus") Long idAutobus);

    @Query(value = "SELECT COUNT(*)\r\n" + //
            "FROM buscyl.asientos\r\n" + //
            "WHERE id_autobus = :idAutobus AND activo = false\r\n", nativeQuery = true)
    Long obtenerAsientosAveriados(@Param("idAutobus") Long idAutobus);

     @Query(value = "SELECT * \r\n" + //
            "FROM buscyl.asientos\r\n" + //
            "WHERE id_autobus = :idAutobus AND numero = :num\r\n", nativeQuery = true)
    Optional<Asiento> obtenerAsientoPorNumyBus(@Param("idAutobus") Long idAutobus, @Param("num") int num);
}
