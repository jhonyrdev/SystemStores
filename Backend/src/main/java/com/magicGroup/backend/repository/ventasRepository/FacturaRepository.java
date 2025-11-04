package com.magicGroup.backend.repository.ventasRepository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.magicGroup.backend.model.ventas.Factura;

public interface FacturaRepository extends JpaRepository<Factura, Integer> {
}
