package com.magicGroup.backend.Controller.ventasController;

import com.magicGroup.backend.services.ventasServices.ventasServicesImpl.PedidoServiceImpl;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.*;
import java.time.*;
import java.math.BigDecimal;

@RestController
@RequestMapping("/api/pedidos")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class PedidoController {
    
    private final PedidoServiceImpl pedidoService;
    private final ObjectMapper objectMapper;
    
    public PedidoController(PedidoServiceImpl pedidoService, ObjectMapper objectMapper) {
        this.pedidoService = pedidoService;
        this.objectMapper = objectMapper;
    }
    
    @PostMapping("/registrar")
    public ResponseEntity<Map<String, Object>> registrarPedido(@RequestBody Map<String, Object> body) {
        try {
            System.out.println("=== Body recibido ===");
            System.out.println(body);
            
            // Extraer y validar parámetros
            Number idClienteNum = (Number) body.get("id_cli");
            if (idClienteNum == null) {
                throw new IllegalArgumentException("El campo 'id_cli' es requerido");
            }
            Integer idCliente = idClienteNum.intValue();
            
            String tipoEntrega = (String) body.get("tipo_entrega");
            if (tipoEntrega == null || tipoEntrega.isEmpty()) {
                throw new IllegalArgumentException("El campo 'tipo_entrega' es requerido");
            }
            
            // id_dir puede ser null si es tipo "recojo"
            Number idDireccionNum = (Number) body.get("id_dir");
            Integer idDireccion = idDireccionNum != null ? idDireccionNum.intValue() : null;
            
            // Convertir total a BigDecimal para mayor precisión
            Object totalObj = body.get("total");
            if (totalObj == null) {
                throw new IllegalArgumentException("El campo 'total' es requerido");
            }
            BigDecimal total = new BigDecimal(totalObj.toString());
            
            // Validar y convertir detalles
            List<Map<String, Object>> detallesList = (List<Map<String, Object>>) body.get("detalles");
            if (detallesList == null || detallesList.isEmpty()) {
                throw new IllegalArgumentException("El campo 'detalles' es requerido y no puede estar vacío");
            }
            
            String detallesJson = objectMapper.writeValueAsString(detallesList);
            
            System.out.println("=== Parámetros procesados ===");
            System.out.println("idCliente: " + idCliente);
            System.out.println("tipoEntrega: " + tipoEntrega);
            System.out.println("idDireccion: " + idDireccion);
            System.out.println("total: " + total);
            System.out.println("detallesJson: " + detallesJson);
            
            // Registrar pedido
            Integer idPedido = pedidoService.registrarPedido(idCliente, tipoEntrega, idDireccion, total, detallesJson);
            
            // Preparar respuesta exitosa
            Map<String, Object> response = new HashMap<>();
            response.put("mensaje", "Pedido registrado correctamente");
            response.put("id_ped", idPedido);
            response.put("estado", "Nuevo");
            response.put("fecha", LocalDate.now().toString());
            response.put("hora", LocalTime.now().toString());
            
            System.out.println("=== Pedido registrado exitosamente ===");
            System.out.println("ID Pedido: " + idPedido);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (IllegalArgumentException e) {
            System.err.println("Error de validación: " + e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error de validación");
            errorResponse.put("mensaje", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
            
        } catch (Exception e) {
            System.err.println("Error al registrar pedido:");
            e.printStackTrace();
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error al registrar pedido");
            errorResponse.put("mensaje", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
}