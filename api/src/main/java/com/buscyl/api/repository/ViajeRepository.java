package com.buscyl.api.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.buscyl.api.entity.Viaje;

public interface ViajeRepository extends JpaRepository<Viaje, Long> {

    @Query(value = "SELECT v.id, v.id_origen, v.id_destino, v.id_autobus, v.id_conductor, v.fecha_viaje, v.hora_salida, v.hora_llegada, v.activo \r\n"
            + //
            "FROM buscyl.viajes v\r\n" + //
            "JOIN buscyl.autobuses a \r\n" + //
            "ON a.id = v.id_autobus\r\n" + //
            "WHERE a.id_empresa = :idEmpresa\r\n" + //
            "AND v.id_origen = :idOrigen AND v.id_destino = :idDestino\r\n" + //
            "AND v.fecha_viaje = :fecha\r\n" + //
            "LIMIT 10 OFFSET (:pagina - 1) * 10", nativeQuery = true)
    List<Viaje> obtenerViajesPaginadosCoordinador(@Param("pagina") int pagina,
            @Param("idEmpresa") Long idEmpresa,
            @Param("idOrigen") Long idOrigen,
            @Param("idDestino") Long idDestino,
            @Param("fecha") LocalDate fecha);

    @Query(value = "SELECT COUNT(*) \r\n" + //
            "FROM buscyl.viajes v\r\n" + //
            "JOIN buscyl.autobuses a \r\n" + //
            "ON a.id = v.id_autobus\r\n" + //
            "WHERE a.id_empresa = :idEmpresa\r\n" + //
            "AND v.id_origen = :idOrigen AND v.id_destino = :idDestino\r\n" + //
            "AND v.fecha_viaje = :fecha\r\n", nativeQuery = true)
    long obtenerTotalViajesFiltradosCoordinador(@Param("idEmpresa") Long idEmpresa,
            @Param("idOrigen") Long idOrigen,
            @Param("idDestino") Long idDestino,
            @Param("fecha") LocalDate fecha);
}
