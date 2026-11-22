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
                        "ORDER BY v.hora_salida\r\n" + //
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

        @Query(value = "WITH ids_viajes_cte AS (SELECT distinct p.id_viaje AS id\r\n" + //
                        "FROM buscyl.paradas p\r\n" + //
                        "JOIN buscyl.viajes v ON v.id = p.id_viaje\r\n" + //
                        "WHERE fecha_viaje = :fecha\r\n" + //
                        "AND ((SELECT MAX(orden) \r\n" + //
                        "FROM buscyl.paradas p1\r\n" + //
                        "WHERE p1.id_viaje = p.id_viaje\r\n" + //
                        "AND id_localidad = :idDestino\r\n" + //
                        ") > (SELECT MIN(orden) \r\n" + //
                        "FROM buscyl.paradas p1\r\n" + //
                        "WHERE p1.id_viaje = p.id_viaje\r\n" + //
                        "AND id_localidad = :idOrigen\r\n" + //
                        ")))\r\n" + //
                        "\r\n" + //
                        "SELECT *\r\n" + //
                        "FROM buscyl.viajes\r\n" + //
                        "WHERE id IN (SELECT ID FROM ids_viajes_cte)\r\n" + //
                        "ORDER BY hora_salida\r\n" + //
                        "LIMIT 10 OFFSET (:pagina - 1) * 10", nativeQuery = true)
        List<Viaje> obtenerViajesPaginadosPasajero(@Param("pagina") int pagina,
                        @Param("idOrigen") Long idOrigen,
                        @Param("idDestino") Long idDestino,
                        @Param("fecha") LocalDate fecha);

        @Query(value = "WITH ids_viajes_cte AS (SELECT distinct p.id_viaje AS id\r\n" + //
                        "FROM buscyl.paradas p\r\n" + //
                        "JOIN buscyl.viajes v ON v.id = p.id_viaje\r\n" + //
                        "WHERE fecha_viaje = :fecha\r\n" + //
                        "AND ((SELECT MAX(orden) \r\n" + //
                        "FROM buscyl.paradas p1\r\n" + //
                        "WHERE p1.id_viaje = p.id_viaje\r\n" + //
                        "AND id_localidad = :idDestino\r\n" + //
                        ") > (SELECT MIN(orden) \r\n" + //
                        "FROM buscyl.paradas p1\r\n" + //
                        "WHERE p1.id_viaje = p.id_viaje\r\n" + //
                        "AND id_localidad = :idOrigen\r\n" + //
                        ")))\r\n" + //
                        "\r\n" + //
                        "SELECT COUNT(*)\r\n" + //
                        "FROM buscyl.viajes\r\n" + //
                        "WHERE id IN (SELECT ID FROM ids_viajes_cte)\r\n", nativeQuery = true)
        long obtenerTotalViajesPasajero(@Param("idOrigen") Long idOrigen,
                        @Param("idDestino") Long idDestino,
                        @Param("fecha") LocalDate fecha);
}
