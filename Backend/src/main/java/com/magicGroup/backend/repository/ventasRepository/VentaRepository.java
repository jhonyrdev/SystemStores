package com.magicGroup.backend.repository.ventasRepository;

import com.magicGroup.backend.model.ventas.Venta;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VentaRepository extends JpaRepository<Venta, Integer> {

}
