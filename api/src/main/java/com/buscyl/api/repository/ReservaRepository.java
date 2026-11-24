package com.buscyl.api.repository;

import java.time.LocalDate;
import java.time.LocalTime;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.buscyl.api.entity.Reserva;

public interface ReservaRepository extends JpaRepository<Reserva, Long> {

    @Query(value = "SELECT COUNT(*)\r\n" + //
            "FROM buscyl.reservas r\r\n" + //
            "JOIN buscyl.viajes v ON v.id = r.id_viaje\r\n" + //
            "WHERE id_pasajero = :idPasajero\r\n" + //
            "AND fecha_viaje = :fechaViaje\r\n" + //
            "AND estado = 'confirmada'\r\n" + //
            "AND (SELECT hora_salida FROM buscyl.paradas WHERE id = r.id_parada_origen) < :horaLlegadaParadaDestino\r\n" + //
            "AND (SELECT hora_llegada FROM buscyl.paradas WHERE id= r.id_parada_destino) > :horaSalidaParadaOrigen\r\n", nativeQuery = true)
    Long obtenerNumReservasSolapadas(@Param("idPasajero") Long idPasajero,
            @Param("fechaViaje") LocalDate fechaViaje,
            @Param("horaLlegadaParadaDestino") LocalTime horaLlegadaParadaDestino,
            @Param("horaSalidaParadaOrigen") LocalTime horaSalidaParadaOrigen);
}
