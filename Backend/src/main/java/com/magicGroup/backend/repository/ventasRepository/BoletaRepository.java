package com.magicGroup.backend.repository.ventasRepository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.magicGroup.backend.model.ventas.Boleta;

public interface BoletaRepository extends JpaRepository<Boleta, Integer> {
}

