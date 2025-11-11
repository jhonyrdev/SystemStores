package com.magicGroup.backend.services.ventasServices;

import com.magicGroup.backend.model.ventas.Pedido;
import com.magicGroup.backend.services.GenericService;
import java.util.List;

public interface PedidoService extends GenericService<Pedido, Integer> {
    List<Pedido> obtenerPedidosPorCliente(Integer clienteId);
}
