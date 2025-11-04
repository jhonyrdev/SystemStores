package com.magicGroup.backend.Controller.ventasController;

import com.magicGroup.backend.services.ventasServices.ventasServicesImpl.VentaServiceImpl;
import lombok.RequiredArgsConstructor;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.*;
import java.time.*;
import java.util.*;
import java.math.BigDecimal;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/ventas")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class VentaController {
    
    private final VentaServiceImpl ventaService;
    private final ObjectMapper objectMapper;
    
    @PostMapping("/registrar")
    public ResponseEntity<Map<String, Object>> registrarVenta(@RequestBody Map<String, Object> body) {
        try {
          
            Number idClienteNum = (Number) body.get("id_cli");
            if (idClienteNum == null) {
                throw new IllegalArgumentException("El campo 'id_cli' es requerido");
            }
            Integer idCliente = idClienteNum.intValue();
            
            Number idPedidoNum = (Number) body.get("id_ped");
            Integer idPedido = idPedidoNum != null ? idPedidoNum.intValue() : null;
            
            Number idMetodoNum = (Number) body.get("id_metodo");
            if (idMetodoNum == null) {
                throw new IllegalArgumentException("El campo 'id_metodo' es requerido");
            }
            Integer idMetodo = idMetodoNum.intValue();
            
            Object totalObj = body.get("total");
            if (totalObj == null) {
                throw new IllegalArgumentException("El campo 'total' es requerido");
            }
            BigDecimal total = new BigDecimal(totalObj.toString());
            
            String tipo = (String) body.get("tipo");
            if (tipo == null || tipo.isEmpty()) {
                throw new IllegalArgumentException("El campo 'tipo' es requerido");
            }
            if (!tipo.equals("boleta") && !tipo.equals("factura")) {
                throw new IllegalArgumentException("El campo 'tipo' debe ser 'boleta' o 'factura'");
            }
            
            String codigo = (String) body.get("codigo");
            if (codigo == null || codigo.isEmpty()) {
                throw new IllegalArgumentException("El campo 'codigo' es requerido");
            }
            
            // Validar campos específicos para factura
            String ruc = null;
            String razonSocial = null;
            if (tipo.equals("factura")) {
                ruc = body.get("ruc_cliente") != null ? (String) body.get("ruc_cliente") : null;
                razonSocial = body.get("razon_social_cliente") != null ? (String) body.get("razon_social_cliente") : null;
                
                if (ruc == null || ruc.isEmpty()) {
                    throw new IllegalArgumentException("El campo 'ruc_cliente' es requerido para facturas");
                }
                if (razonSocial == null || razonSocial.isEmpty()) {
                    throw new IllegalArgumentException("El campo 'razon_social_cliente' es requerido para facturas");
                }
            }
            
            List<Map<String, Object>> detallesList = objectMapper.convertValue(
                body.get("detalles"),
                new TypeReference<List<Map<String, Object>>>() {}
            );
            
            if (detallesList == null || detallesList.isEmpty()) {
                throw new IllegalArgumentException("El campo 'detalles' es requerido y no puede estar vacío");
            }
            
            String detallesJson = objectMapper.writeValueAsString(detallesList);
            
            ventaService.registrarVenta(idCliente, idPedido, idMetodo, total, tipo, 
                                       codigo, ruc, razonSocial, detallesJson);
            
            Map<String, Object> response = new HashMap<>();
            response.put("mensaje", "Venta registrada correctamente");
            response.put("id_ped", idPedido);
            response.put("tipo", tipo);
            response.put("codigo", codigo);
            response.put("fecha", LocalDate.now().toString());
            response.put("hora", LocalTime.now().toString());

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (IllegalArgumentException e) {
            System.err.println("Error de validación: " + e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error de validación");
            errorResponse.put("mensaje", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
            
        } catch (Exception e) {
            System.err.println("Error al registrar venta:");
            e.printStackTrace();
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error al registrar venta");
            errorResponse.put("mensaje", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
}
