package com.magicGroup.backend.repository.ventasRepository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.magicGroup.backend.model.ventas.DetallePedido;
import java.util.List;

public interface DetallePedidoRepository extends JpaRepository<DetallePedido, Integer> {
	List<DetallePedido> findByPedido_IdPed(Integer idPed);
}
