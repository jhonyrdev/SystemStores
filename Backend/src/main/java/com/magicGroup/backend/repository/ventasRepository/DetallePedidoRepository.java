package com.magicGroup.backend.repository.ventasRepository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.magicGroup.backend.model.ventas.DetallePedido;

public interface DetallePedidoRepository extends JpaRepository<DetallePedido, Integer> {
}
