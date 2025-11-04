package com.magicGroup.backend.services.ventasServices.ventasServicesImpl;

import com.magicGroup.backend.model.ventas.Pedido;
import com.magicGroup.backend.repository.ventasRepository.PedidoRepository;
import com.magicGroup.backend.services.GenericServiceImpl;
import com.magicGroup.backend.services.ventasServices.PedidoService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import jakarta.persistence.*;
import java.math.BigDecimal;

@Service
public class PedidoServiceImpl extends GenericServiceImpl<Pedido, Integer> implements PedidoService {
    

    private final EntityManager entityManager; 
    
    public PedidoServiceImpl(PedidoRepository pedidoRepository, EntityManager entityManager) {
        super(pedidoRepository);
        this.entityManager = entityManager;
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