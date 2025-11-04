package com.magicGroup.backend.services.ventasServices.ventasServicesImpl;

import com.magicGroup.backend.model.ventas.DetalleVenta;
import com.magicGroup.backend.services.GenericServiceImpl;
import com.magicGroup.backend.repository.ventasRepository.DetalleVentaRepository;
import com.magicGroup.backend.services.ventasServices.DetalleVentaService;
import org.springframework.stereotype.Service;

@Service
public class DetalleVentaServiceImpl extends 
        GenericServiceImpl<DetalleVenta, Integer> 
        implements DetalleVentaService {

    public DetalleVentaServiceImpl(DetalleVentaRepository repository) {
        super(repository);
    }
}