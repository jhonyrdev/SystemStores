/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */

package com.magicGroup.backend.services.ventasServices.ventasServicesImpl;

import com.magicGroup.backend.model.ventas.DetallePedido;
import com.magicGroup.backend.repository.ventasRepository.DetallePedidoRepository;
import com.magicGroup.backend.services.GenericServiceImpl;
import com.magicGroup.backend.services.ventasServices.DetallePedidoService;
import org.springframework.stereotype.Service;

/**
 *
 * @author Jhonn
 */

@Service
public class DetallePedidoServiceImpl extends GenericServiceImpl<DetallePedido, Integer> implements DetallePedidoService {

    public DetallePedidoServiceImpl(DetallePedidoRepository repository) {
        super(repository);
    }
}
