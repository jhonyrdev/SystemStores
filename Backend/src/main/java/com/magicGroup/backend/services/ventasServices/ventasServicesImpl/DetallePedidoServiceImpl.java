package com.magicGroup.backend.services.ventasServices.ventasServicesImpl;

import com.magicGroup.backend.model.ventas.DetallePedido;
import com.magicGroup.backend.repository.ventasRepository.DetallePedidoRepository;
import com.magicGroup.backend.services.GenericServiceImpl;
import com.magicGroup.backend.services.ventasServices.DetallePedidoService;
import org.springframework.stereotype.Service;

@Service
public class DetallePedidoServiceImpl extends GenericServiceImpl<DetallePedido, Integer> implements DetallePedidoService {

    public DetallePedidoServiceImpl(DetallePedidoRepository repository) {
        super(repository);
    }
}
