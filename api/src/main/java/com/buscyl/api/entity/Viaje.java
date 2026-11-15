package com.buscyl.api.entity;

import java.time.LocalDate;
import java.time.LocalTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "viajes")
public class Viaje {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "id_origen", nullable = false)
    private Localidad origen;

    @ManyToOne(optional = false)
    @JoinColumn(name = "id_destino", nullable = false)
    private Localidad destino;

    @ManyToOne(optional = false)
    @JoinColumn(name = "id_autobus", nullable = false)
    private Autobus autobus;

    @ManyToOne(optional = false)
    @JoinColumn(name = "id_conductor", nullable = false)
    private Usuario conductor;

    @Column(name = "fecha_viaje", nullable = false)
    private LocalDate fechaViaje;

    @Column(name = "hora_salida", nullable = false)
    private LocalTime horaSalida;

    @Column(name = "hora_llegada", nullable = false)
    private LocalTime horaLlegada;

    @Builder.Default
    @Column(name = "activo", nullable = false)
    private Boolean activo = true;
}
