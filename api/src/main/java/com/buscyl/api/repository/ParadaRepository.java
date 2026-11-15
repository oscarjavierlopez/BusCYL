package com.buscyl.api.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import com.buscyl.api.entity.Parada;

public interface ParadaRepository extends JpaRepository<Parada, Long>{
    Optional<Parada> findByOrden(int orden);
}
