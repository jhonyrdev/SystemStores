package com.magicGroup.backend.Controller.ventasController;

import com.magicGroup.backend.model.ventas.*;
import com.magicGroup.backend.services.ventasServices.ventasServicesImpl.PedidoServiceImpl;
import com.magicGroup.backend.services.ventasServices.DetallePedidoService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;
import java.util.*;
import java.time.*;
import java.math.BigDecimal;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/pedidos")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class PedidoController {

    private final PedidoServiceImpl pedidoService;
    private final DetallePedidoService detallePedidoService;
    private final ObjectMapper objectMapper;

    @GetMapping("/cliente/{clienteId}")
    public ResponseEntity<List<Pedido>> obtenerPedidosPorCliente(@PathVariable Integer clienteId) {
        try {
            List<Pedido> pedidos = pedidoService.obtenerPedidosPorCliente(clienteId);
            return ResponseEntity.ok(pedidos);
        } catch (Exception e) {
            System.err.println("Error al obtener pedidos del cliente: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{idPedido}/detalles")
    public ResponseEntity<List<DetallePedido>> obtenerDetallesPedido(@PathVariable Integer idPedido) {
        try {
            List<DetallePedido> detalles = detallePedidoService.obtenerDetallesPorPedido(idPedido);
            return ResponseEntity.ok(detalles);
        } catch (Exception e) {
            System.err.println("Error al obtener detalles del pedido: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/cancelar/{idPedido}")
    public ResponseEntity<Map<String, Object>> cancelarPedido(@PathVariable Integer idPedido) {
        try {
            pedidoService.cancelarPedido(idPedido);

            Map<String, Object> response = new HashMap<>();
            response.put("mensaje", "Pedido cancelado correctamente");
            response.put("id_ped", idPedido);
            response.put("estado", "Rechazado");

            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error de validación");
            errorResponse.put("mensaje", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        } catch (Exception e) {
            System.err.println("Error al cancelar pedido: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error al cancelar pedido");
            errorResponse.put("mensaje", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @GetMapping("/todos")
    public ResponseEntity<List<Pedido>> obtenerTodosPedidos() {
        try {
            List<Pedido> pedidos = pedidoService.listarTodos();
            return ResponseEntity.ok(pedidos);
        } catch (Exception e) {
            System.err.println("Error al obtener todos los pedidos: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/actualizar-estado/{idPedido}")
    public ResponseEntity<Map<String, Object>> actualizarEstadoPedido(
            @PathVariable Integer idPedido,
            @RequestBody Map<String, String> body) {
        try {
            String nuevoEstado = body.get("estado");
            if (nuevoEstado == null || nuevoEstado.isEmpty()) {
                throw new IllegalArgumentException("El estado es requerido");
            }

            pedidoService.actualizarEstado(idPedido, nuevoEstado);

            Map<String, Object> response = new HashMap<>();
            response.put("mensaje", "Estado del pedido actualizado correctamente");
            response.put("id_ped", idPedido);
            response.put("estado", nuevoEstado);

            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error de validación");
            errorResponse.put("mensaje", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        } catch (Exception e) {
            System.err.println("Error al actualizar estado del pedido: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error al actualizar estado");
            errorResponse.put("mensaje", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @PostMapping("/registrar")
    public ResponseEntity<Map<String, Object>> registrarPedido(@RequestBody Map<String, Object> body) {
        try {
            Number idClienteNum = (Number) body.get("id_cli");
            if (idClienteNum == null) {
                throw new IllegalArgumentException("El campo 'id_cli' es requerido");
            }
            Integer idCliente = idClienteNum.intValue();

            String tipoEntrega = (String) body.get("tipo_entrega");
            if (tipoEntrega == null || tipoEntrega.isEmpty()) {
                throw new IllegalArgumentException("El campo 'tipo_entrega' es requerido");
            }

            Number idDireccionNum = (Number) body.get("id_dir");
            Integer idDireccion = idDireccionNum != null ? idDireccionNum.intValue() : null;

            Object totalObj = body.get("total");
            if (totalObj == null) {
                throw new IllegalArgumentException("El campo 'total' es requerido");
            }
            BigDecimal total = new BigDecimal(totalObj.toString());

            List<Map<String, Object>> detallesList = objectMapper.convertValue(
                    body.get("detalles"),
                    new TypeReference<List<Map<String, Object>>>() {
                    });

            if (detallesList == null || detallesList.isEmpty()) {
                throw new IllegalArgumentException("El campo 'detalles' es requerido y no puede estar vacío");
            }

            String detallesJson = objectMapper.writeValueAsString(detallesList);
            Integer idPedido = pedidoService.registrarPedido(idCliente, tipoEntrega, idDireccion, total, detallesJson);

            // Preparar respuesta exitosa
            Map<String, Object> response = new HashMap<>();
            response.put("mensaje", "Pedido registrado correctamente");
            response.put("id_ped", idPedido);
            response.put("estado", "Nuevo");
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
            System.err.println("Error al registrar pedido:");
            e.printStackTrace();
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error al registrar pedido");
            errorResponse.put("mensaje", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @DeleteMapping("/{idPedido}")
    public ResponseEntity<Map<String, Object>> eliminarPedido(@PathVariable Integer idPedido) {
        try {
            pedidoService.eliminarPedido(idPedido);
            Map<String, Object> response = new HashMap<>();
            response.put("mensaje", "Pedido eliminado correctamente");
            response.put("id_ped", idPedido);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error de validación");
            errorResponse.put("mensaje", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        } catch (Exception e) {
            System.err.println("Error al eliminar pedido: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error al eliminar pedido");
            errorResponse.put("mensaje", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

}
