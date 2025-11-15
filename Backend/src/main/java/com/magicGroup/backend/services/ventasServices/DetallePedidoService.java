package com.magicGroup.backend.services.ventasServices;

import com.magicGroup.backend.model.ventas.DetallePedido;
import com.magicGroup.backend.services.GenericService;
import java.util.List;

public interface DetallePedidoService extends GenericService<DetallePedido, Integer> {
	List<DetallePedido> obtenerDetallesPorPedido(Integer idPedido);
}
