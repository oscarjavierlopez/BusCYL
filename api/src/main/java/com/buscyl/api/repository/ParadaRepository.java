package com.buscyl.api.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.buscyl.api.entity.Parada;

public interface ParadaRepository extends JpaRepository<Parada, Long> {
    Optional<Parada> findByOrden(int orden);

    @Query(value = "SELECT p.id, p.id_viaje, p.id_localidad, p.hora_llegada, p.hora_salida, p.direccion, p.orden\r\n" + //
            "FROM buscyl.paradas p \r\n" + //
            "WHERE id_viaje = :idViaje\r\n" + //
            "AND p.orden BETWEEN (SELECT MIN(orden) \r\n" + //
            "FROM buscyl.paradas p1\r\n" + //
            "WHERE p1.id_viaje = p.id_viaje\r\n" + //
            "AND p1.id_localidad = :idOrigen\r\n" + //
            ") AND (SELECT MAX(orden) \r\n" + //
            "FROM buscyl.paradas p1\r\n" + //
            "WHERE p1.id_viaje = p.id_viaje\r\n" + //
            "AND p1.id_localidad = :idDestino)\r\n" + //
            "ORDER BY p.orden", nativeQuery = true)
    List<Parada> obtenerParadasViaje(@Param("idOrigen") Long idOrigen,
            @Param("idDestino") Long idDestino,
            @Param("idViaje") Long idViaje);
}
