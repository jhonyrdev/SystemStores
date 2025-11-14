package com.magicGroup.backend.Controller.usuariosController;

import com.magicGroup.backend.model.usuarios.Cliente;
import com.magicGroup.backend.services.usuariosServices.ClienteService;
import com.magicGroup.backend.repository.ventasRepository.VentaRepository;
import java.math.BigDecimal;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/clientes")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class ClienteController {

	private final ClienteService clienteService;
	private final VentaRepository ventaRepository;

	public ClienteController(ClienteService clienteService, VentaRepository ventaRepository) {
		this.clienteService = clienteService;
		this.ventaRepository = ventaRepository;
	}

	@GetMapping
	public List<Map<String, Object>> listarClientes() {
		return clienteService.listarTodos().stream()
				.map(cliente -> {
					Map<String, Object> map = new HashMap<>();
					map.put("idCliente", cliente.getIdCli());
					map.put("nombre", cliente.getNomCli());
					map.put("apellido", cliente.getApeCli());
					map.put("correo", cliente.getCorreoCli());
					map.put("telefono", cliente.getTelCli());
					map.put("estado", cliente.getEstado().toString());
					map.put("fechaRegistro", cliente.getFechaReg());
					return map;
				})
				.toList();
	}

	@GetMapping("/gastos")
	public List<Map<String, Object>> listarGastosClientes() {
		// Obtener mapa idCli -> totalGastado
		Map<Integer, BigDecimal> gastos = new HashMap<>();
		ventaRepository.obtenerGastosPorCliente().forEach(p -> gastos.put(p.getIdCli(), p.getTotalGastado()));

		return clienteService.listarTodos().stream()
				.map(cliente -> {
					Map<String, Object> map = new HashMap<>();
					map.put("idCliente", cliente.getIdCli());
					map.put("nombre", cliente.getNomCli());
					map.put("apellido", cliente.getApeCli());
					map.put("correo", cliente.getCorreoCli());
					map.put("estado", cliente.getEstado().toString());
					map.put("gastoTotal", gastos.getOrDefault(cliente.getIdCli(), BigDecimal.ZERO));
					return map;
				})
				.toList();
	}

	@PutMapping("/{id}")
	public ResponseEntity<?> actualizarCliente(@PathVariable Integer id, @RequestBody Cliente clienteActualizado) {
		Optional<Cliente> optCliente = clienteService.obtenerPorId(id);

		if (optCliente.isEmpty()) {
			return ResponseEntity.notFound().build();
		}

		Cliente cliente = optCliente.get();

		cliente.setNomCli(clienteActualizado.getNomCli());
		cliente.setApeCli(clienteActualizado.getApeCli());
		cliente.setCorreoCli(clienteActualizado.getCorreoCli());
		cliente.setTelCli(clienteActualizado.getTelCli());

		clienteService.guardar(cliente);

		return ResponseEntity.ok(Map.of(
				"message", "Cliente actualizado correctamente",
				"cliente", cliente
		));
	}
}
