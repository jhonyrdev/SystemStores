package com.magicGroup.backend.services.ventasServices.ventasServicesImpl;

import com.magicGroup.backend.model.ventas.Venta;
import com.magicGroup.backend.repository.ventasRepository.VentaRepository;
import com.magicGroup.backend.services.GenericServiceImpl;
import com.magicGroup.backend.services.ventasServices.VentaService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import jakarta.persistence.EntityManager;
import jakarta.persistence.ParameterMode;
import jakarta.persistence.StoredProcedureQuery;
import java.math.BigDecimal;

@Service
public class VentaServiceImpl extends GenericServiceImpl<Venta, Integer> implements VentaService {
    
    private final VentaRepository ventaRepository;
    private final EntityManager entityManager; 
    
    public VentaServiceImpl(VentaRepository ventaRepository, EntityManager entityManager) {
        super(ventaRepository);
        this.ventaRepository = ventaRepository;
        this.entityManager = entityManager; 
    }
    
    @Transactional
    public void registrarVenta(Integer idCliente, Integer idPedido, Integer idMetodo, BigDecimal total, 
                               String tipo, String codigo, String rucCliente, String razonSocial, 
                               String detallesJson) {
        try {
            StoredProcedureQuery query = entityManager
                .createStoredProcedureQuery("RegistrarVenta")
                .registerStoredProcedureParameter("p_id_cli", Integer.class, ParameterMode.IN)
                .registerStoredProcedureParameter("p_id_ped", Integer.class, ParameterMode.IN)
                .registerStoredProcedureParameter("p_id_metodo", Integer.class, ParameterMode.IN)
                .registerStoredProcedureParameter("p_total", BigDecimal.class, ParameterMode.IN)
                .registerStoredProcedureParameter("p_tipo", String.class, ParameterMode.IN)
                .registerStoredProcedureParameter("p_codigo", String.class, ParameterMode.IN)
                .registerStoredProcedureParameter("p_ruc_cliente", String.class, ParameterMode.IN)
                .registerStoredProcedureParameter("p_razon_social_cliente", String.class, ParameterMode.IN)
                .registerStoredProcedureParameter("p_detalles", String.class, ParameterMode.IN);
            
            query.setParameter("p_id_cli", idCliente);
            query.setParameter("p_id_ped", idPedido); 
            query.setParameter("p_id_metodo", idMetodo);
            query.setParameter("p_total", total);
            query.setParameter("p_tipo", tipo);
            query.setParameter("p_codigo", codigo);
            query.setParameter("p_ruc_cliente", rucCliente);
            query.setParameter("p_razon_social_cliente", razonSocial);
            query.setParameter("p_detalles", detallesJson);
            
            query.execute();
            
            System.out.println("Venta registrada exitosamente mediante procedimiento almacenado");
            
        } catch (Exception e) {
            throw new RuntimeException("Error al registrar venta: " + e.getMessage(), e);
        }
    }
}