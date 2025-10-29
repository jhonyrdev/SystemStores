package com.magicGroup.backend.repository.ventasRepository;

import com.magicGroup.backend.model.ventas.Venta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.query.Procedure;
import org.springframework.data.repository.query.Param;

public interface VentaRepository extends JpaRepository<Venta, Integer> {

}
