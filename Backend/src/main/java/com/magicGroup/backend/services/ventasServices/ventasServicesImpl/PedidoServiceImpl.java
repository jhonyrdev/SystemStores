package com.magicGroup.backend.services.ventasServices.ventasServicesImpl;

import com.magicGroup.backend.model.ventas.Pedido;
import com.magicGroup.backend.repository.ventasRepository.PedidoRepository;
import com.magicGroup.backend.services.productosServices.ProductoService;
import com.magicGroup.backend.services.GenericServiceImpl;
import com.magicGroup.backend.services.ventasServices.PedidoService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.List;

@Service
public class PedidoServiceImpl extends GenericServiceImpl<Pedido, Integer> implements PedidoService {

    private final PedidoRepository pedidoRepository;
    private final EntityManager entityManager;
    private final ProductoService productoService;

    public PedidoServiceImpl(PedidoRepository pedidoRepository, EntityManager entityManager,
            ProductoService productoService) {
        super(pedidoRepository);
        this.pedidoRepository = pedidoRepository;
        this.entityManager = entityManager;
        this.productoService = productoService;
    }

    @Override
    public List<Pedido> obtenerPedidosPorCliente(Integer clienteId) {
        return pedidoRepository.findByCliente_IdCli(clienteId);
    }

    @Override
    @Transactional
    public void cancelarPedido(Integer idPedido) {
        Pedido pedido = pedidoRepository.findById(idPedido)
                .orElseThrow(() -> new IllegalArgumentException("Pedido no encontrado con ID: " + idPedido));

        if (pedido.getEstado() != Pedido.Estado.Nuevo) {
            throw new IllegalArgumentException("Solo se pueden cancelar pedidos en estado 'Nuevo'");
        }
        if (pedido.getDetallePedidos() != null && !pedido.getDetallePedidos().isEmpty()) {
            pedido.getDetallePedidos().forEach(det -> {
                Integer idProd = det.getProducto().getIdProd();
                int cantidad = det.getCantidad();
                productoService.increaseStock(idProd, cantidad);
            });
        }

        pedido.setEstado(Pedido.Estado.Rechazado);
        pedidoRepository.save(pedido);
    }

    @Override
    @Transactional
    public void actualizarEstado(Integer idPedido, String nuevoEstado) {
        Pedido pedido = pedidoRepository.findById(idPedido)
                .orElseThrow(() -> new IllegalArgumentException("Pedido no encontrado con ID: " + idPedido));

        try {
            Pedido.Estado estado = Pedido.Estado.valueOf(nuevoEstado);
            pedido.setEstado(estado);
            pedidoRepository.save(pedido);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Estado inválido: " + nuevoEstado +
                    ". Los estados válidos son: Nuevo, Realizado, Rechazado");
        }
    }

    @Override
    @Transactional
    public void eliminarPedido(Integer idPedido) {
        Pedido pedido = pedidoRepository.findById(idPedido)
                .orElseThrow(() -> new IllegalArgumentException("Pedido no encontrado con ID: " + idPedido));

        // Restaurar stock si hay detalles
        if (pedido.getDetallePedidos() != null && !pedido.getDetallePedidos().isEmpty()) {
            pedido.getDetallePedidos().forEach(det -> {
                Integer idProd = det.getProducto().getIdProd();
                int cantidad = det.getCantidad();
                productoService.increaseStock(idProd, cantidad);
            });
        }
        pedidoRepository.delete(pedido);
    }

    @Transactional
    public Integer registrarPedido(Integer idCliente, String tipoEntrega, Integer idDireccion,
            BigDecimal total, String detallesJson) {
        try {
            StoredProcedureQuery query = entityManager
                    .createStoredProcedureQuery("RegistrarPedido")
                    .registerStoredProcedureParameter("p_id_cli", Integer.class, ParameterMode.IN)
                    .registerStoredProcedureParameter("p_tipo_entrega", String.class, ParameterMode.IN)
                    .registerStoredProcedureParameter("p_id_dir", Integer.class, ParameterMode.IN)
                    .registerStoredProcedureParameter("p_total", BigDecimal.class, ParameterMode.IN)
                    .registerStoredProcedureParameter("p_detalles", String.class, ParameterMode.IN)
                    .registerStoredProcedureParameter("p_id_ped", Integer.class, ParameterMode.OUT);

            query.setParameter("p_id_cli", idCliente);
            query.setParameter("p_tipo_entrega", tipoEntrega);
            query.setParameter("p_id_dir", idDireccion);
            query.setParameter("p_total", total);
            query.setParameter("p_detalles", detallesJson);

            query.execute();

            Integer idPedido = (Integer) query.getOutputParameterValue("p_id_ped");

            if (idPedido == null) {
                throw new RuntimeException("No se pudo obtener el ID del pedido generado");
            }

            return idPedido;

        } catch (Exception e) {
            throw new RuntimeException("Error al registrar pedido: " + e.getMessage(), e);
        }
    }
}