package com.buscyl.api.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.buscyl.api.entity.Asiento;

public interface AsientoRepository extends JpaRepository<Asiento, Long> {

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

        @Query(value = "WITH asientos_reservados_cte AS (\r\n" + //
                                "SELECT id_asiento AS id\r\n" + //
                                "FROM buscyl.reservas r\r\n" + //
                                "WHERE id_viaje = :idViaje AND\r\n" + //
                                "estado = 'confirmada' AND \r\n" + //
                                "(SELECT orden FROM buscyl.paradas WHERE id = r.id_parada_origen) < :ordenParadaDestino\r\n" + //
                                "AND (SELECT orden FROM buscyl.paradas WHERE id = r.id_parada_destino) > :ordenParadaOrigen\r\n" + //
                                "ORDER BY id ASC )\r\n" + //
                                "\r\n" + //
                                "SELECT * FROM buscyl.asientos WHERE id IN (SELECT id FROM asientos_reservados_cte)", nativeQuery = true)
        List<Asiento> obtenerAsientosReservadosViaje(@Param("idViaje") Long idViaje,
                        @Param("ordenParadaOrigen") Integer ordenParadaOrigen,
                        @Param("ordenParadaDestino") Integer ordenParadaDestino);
}
