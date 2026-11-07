package com.buscyl.api.entity;

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

import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "empresas")
public class Empresa {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nombre", nullable = false, length = 150)
    private String nombre;

    @Column(name = "razon_social", nullable = false, unique = true, length = 150)
    private String razonSocial;

    @Column(name = "cif", nullable = false, unique = true, length = 9)
    private String cif;

    @Column(name = "telefono", nullable = false, unique = true, length = 15)
    private String telefono;

    @Column(name = "email", nullable = false, unique = true, length = 150)
    private String email;

    @Column(name = "direccion", nullable = false, length = 255)
    private String direccion;

    @ManyToOne(optional = false)
    @JoinColumn(name = "id_localidad", nullable = false)
    private Localidad localidad;

    @Builder.Default
    @Column(name = "activo", nullable = false)
    private Boolean activo = true;

    @OneToMany(mappedBy = "empresa")
    private List<Usuario> usuarios;
}
