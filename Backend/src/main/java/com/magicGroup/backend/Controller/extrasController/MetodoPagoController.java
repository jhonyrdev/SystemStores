package com.magicGroup.backend.Controller.extrasController;

import com.magicGroup.backend.model.extras.MetodoPago;
import com.magicGroup.backend.services.extrasServices.MetodoPagoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/metodosPago")
@CrossOrigin(origins = "http://localhost:5173" , allowCredentials = "true")
public class MetodoPagoController {

	private final MetodoPagoService metodoPagoService;

	public MetodoPagoController(MetodoPagoService metodoPagoService) {
		this.metodoPagoService = metodoPagoService;
	}

	@GetMapping
	public ResponseEntity<List<Map<String, Object>>> listarMetodosPago() {
		var metodos = metodoPagoService.listarTodos().stream()
				.map(metodo -> Map.<String, Object>of(
						"idMetodo", metodo.getIdMetodo(),
						"nombreMetodo", metodo.getNombreMetodo()
				))
				.toList();

		return ResponseEntity.ok(metodos);
	}

	@GetMapping("/{id}")
	public ResponseEntity<Map<String, Object>> obtenerPorId(@PathVariable Integer id) {
		return metodoPagoService.obtenerPorId(id)
				.map(metodo -> Map.<String, Object>of(
						"idMetodo", metodo.getIdMetodo(),
						"nombreMetodo", metodo.getNombreMetodo()
				))
				.map(ResponseEntity::ok)
				.orElse(ResponseEntity.notFound().build());
	}

	@PostMapping
	public ResponseEntity<MetodoPago> guardarMetodoPago(@RequestBody MetodoPago metodoPago) {
		return ResponseEntity.ok(metodoPagoService.guardar(metodoPago));
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> eliminarMetodoPago(@PathVariable Integer id) {
		metodoPagoService.eliminarPorId(id);
		return ResponseEntity.noContent().build();
	}
}
