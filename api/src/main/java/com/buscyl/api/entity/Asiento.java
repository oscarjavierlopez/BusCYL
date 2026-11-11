package com.buscyl.api.entity;

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
@Table(name = "asientos")
public class Asiento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "id_autobus", nullable = false)
    private Autobus autobus;

    @Column(name = "numero", nullable = false)
    private Integer numero;

    @Builder.Default
    @Pattern(regexp = "normal|adaptado")
    @Column(name = "tipo", nullable = false, length = 10)
    private String tipo = "normal";

    @Builder.Default
    @Column(name = "activo", nullable = false)
    private Boolean activo = true;
}
