package com.buscyl.api.entity;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Pattern;
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
@Table(name = "reservas")
public class Reserva {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "id_pasajero", nullable = false)
    private Usuario pasajero;

    @ManyToOne(optional = false)
    @JoinColumn(name = "id_viaje", nullable = false)
    private Viaje viaje;

    @ManyToOne(optional = false)
    @JoinColumn(name = "id_asiento", nullable = false)
    private Asiento asiento;

    @ManyToOne(optional = false)
    @JoinColumn(name = "id_parada_origen", nullable = false)
    private Parada paradaOrigen;

    @ManyToOne(optional = false)
    @JoinColumn(name = "id_parada_destino", nullable = false)
    private Parada paradaDestino;

    @Builder.Default
    @Pattern(regexp = "confirmada|cancelada")
    @Column(name = "estado", nullable = false, length = 10)
    private String estado = "confirmada";

    @Column(name = "fecha_reserva", nullable = false)
    private LocalDate fechaReserva;

    @Column(name = "fecha_cancelacion")
    private LocalDate fechaCancelacion;

    @Column(name = "codigo_qr", nullable = false, length = 255)
    private String codigoQr;
}
