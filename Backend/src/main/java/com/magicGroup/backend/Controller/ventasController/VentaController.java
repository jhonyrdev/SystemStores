package com.magicGroup.backend.Controller.ventasController;

import com.magicGroup.backend.services.ventasServices.ventasServicesImpl.VentaServiceImpl;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import java.time.*;
import java.util.*;
import java.math.BigDecimal;

@RestController
@RequestMapping("/api/ventas")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class VentaController {
    
    private final VentaServiceImpl ventaService;
    private final ObjectMapper objectMapper;
    
    public VentaController(VentaServiceImpl ventaService, ObjectMapper objectMapper) {
        this.ventaService = ventaService;
        this.objectMapper = objectMapper;
    }
    
    @PostMapping("/registrar")
    public ResponseEntity<Map<String, Object>> registrarVenta(@RequestBody Map<String, Object> body) {
        try {
            System.out.println("=== Body recibido en Venta ===");
            System.out.println(body);
            
            // Extraer y validar parámetros
            Number idClienteNum = (Number) body.get("id_cli");
            if (idClienteNum == null) {
                throw new IllegalArgumentException("El campo 'id_cli' es requerido");
            }
            Integer idCliente = idClienteNum.intValue();
            
            // id_ped puede ser null para ventas directas sin pedido previo
            Number idPedidoNum = (Number) body.get("id_ped");
            Integer idPedido = idPedidoNum != null ? idPedidoNum.intValue() : null;
            
            Number idMetodoNum = (Number) body.get("id_metodo");
            if (idMetodoNum == null) {
                throw new IllegalArgumentException("El campo 'id_metodo' es requerido");
            }
            Integer idMetodo = idMetodoNum.intValue();
            
            // Convertir total a BigDecimal para mayor precisión
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
            
            // Validar y convertir detalles
            List<Map<String, Object>> detallesList = (List<Map<String, Object>>) body.get("detalles");
            if (detallesList == null || detallesList.isEmpty()) {
                throw new IllegalArgumentException("El campo 'detalles' es requerido y no puede estar vacío");
            }
            
            String detallesJson = objectMapper.writeValueAsString(detallesList);
            
            System.out.println("=== Parámetros procesados ===");
            System.out.println("idCliente: " + idCliente);
            System.out.println("idPedido: " + idPedido);
            System.out.println("idMetodo: " + idMetodo);
            System.out.println("total: " + total);
            System.out.println("tipo: " + tipo);
            System.out.println("codigo: " + codigo);
            System.out.println("ruc: " + ruc);
            System.out.println("razonSocial: " + razonSocial);
            System.out.println("detallesJson: " + detallesJson);
            
            // Registrar venta (el procedure no devuelve id_venta, lo genera internamente)
            ventaService.registrarVenta(idCliente, idPedido, idMetodo, total, tipo, 
                                       codigo, ruc, razonSocial, detallesJson);
            
            // Preparar respuesta exitosa
            Map<String, Object> response = new HashMap<>();
            response.put("mensaje", "Venta registrada correctamente");
            response.put("id_ped", idPedido);
            response.put("tipo", tipo);
            response.put("codigo", codigo);
            response.put("fecha", LocalDate.now().toString());
            response.put("hora", LocalTime.now().toString());
            
            System.out.println("=== Venta registrada exitosamente ===");
            
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