package com.buscyl.api.entity;

import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
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
@Table(name = "autobuses")
public class Autobus {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "matricula", nullable = false, unique = true, length = 10)
    private String matricula;

    @ManyToOne(optional = false)
    @JoinColumn(name = "id_empresa", nullable = false)
    private Empresa empresa;

    @Column(name = "numero_bastidor", nullable = false, unique = true, length = 17)
    private String numeroBastidor;

    @Column(name = "numero_flota", nullable = false, unique = true, length = 20)
    private String numeroFlota;

    @Builder.Default
    @Column(name = "activo", nullable = false)
    private Boolean activo = true;

    @OneToMany(mappedBy = "autobus")
    private List<Asiento> asientos;

    @OneToMany(mappedBy = "autobus", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Viaje> viajes;

    public void setAsiento(int indice, Asiento asiento){
        this.asientos.set(indice, asiento);
    }

    public int getIndiceAsiento(Asiento asiento){
        return this.asientos.indexOf(asiento);
    }

    public void addAsiento(Asiento asiento){
        this.asientos.add(asiento);
    }
}
