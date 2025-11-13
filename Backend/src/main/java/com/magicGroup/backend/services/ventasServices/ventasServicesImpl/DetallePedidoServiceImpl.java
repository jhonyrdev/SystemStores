package com.magicGroup.backend.services.ventasServices.ventasServicesImpl;

import com.magicGroup.backend.model.ventas.DetallePedido;
import com.magicGroup.backend.repository.ventasRepository.DetallePedidoRepository;
import com.magicGroup.backend.services.GenericServiceImpl;
import com.magicGroup.backend.services.ventasServices.DetallePedidoService;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class DetallePedidoServiceImpl extends GenericServiceImpl<DetallePedido, Integer> implements DetallePedidoService {

    private final DetallePedidoRepository repository;

    public DetallePedidoServiceImpl(DetallePedidoRepository repository) {
        super(repository);
        this.repository = repository;
    }

    @Override
    public List<DetallePedido> obtenerDetallesPorPedido(Integer idPedido) {
        return repository.findByPedido_IdPed(idPedido);
    }
}
