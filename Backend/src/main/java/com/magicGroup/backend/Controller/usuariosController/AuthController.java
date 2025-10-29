package com.magicGroup.backend.Controller.usuariosController;

import com.magicGroup.backend.model.usuarios.Cliente;
import com.magicGroup.backend.services.extrasServices.AuthService;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class AuthController {

	private final AuthService authService;

	public AuthController(AuthService authService) {
		this.authService = authService;
	}

	// Login Cliente
	@PostMapping("/loginCliente")
	public ResponseEntity<?> loginCliente(@RequestBody Map<String, String> body, HttpServletRequest request) {
		String identificador = body.get("identificador");
		String clave = body.get("clave");

		return authService.loginCliente(identificador, clave, request)
				.<ResponseEntity<?>>map(cliente -> {
					Map<String, String> response = new HashMap<>();
					response.put("message", "Login exitoso");
					return ResponseEntity.ok(response);
				})
				.orElseGet(() -> ResponseEntity.status(401).build());
	}

	@GetMapping("/me")
	public ResponseEntity<?> getLoggedUser(Authentication authentication) {
		if (authentication == null || !(authentication.getPrincipal() instanceof Cliente)) {
			return ResponseEntity.status(401).build();
		}

		Cliente cliente = (Cliente) authentication.getPrincipal();

		Map<String, Object> userData = new HashMap<>();
		userData.put("idCliente", cliente.getIdCli());
		userData.put("nombre", cliente.getNomCli());
		userData.put("apellido", cliente.getApeCli());
		userData.put("correo", cliente.getCorreoCli());
		userData.put("telefono", cliente.getTelCli());

		if (cliente.getCredencial() != null) {
			userData.put("usuario", cliente.getCredencial().getUsuario());
			userData.put("rol", cliente.getCredencial().getRol());
		}

		return ResponseEntity.ok(userData);
	}

	@PostMapping("/logout")
	public ResponseEntity<?> logout(HttpServletRequest request) {
		request.getSession().invalidate();
		SecurityContextHolder.clearContext();
		return ResponseEntity.ok().build();
	}

	// Login Admin
	@PostMapping("/admin/verify")
	public ResponseEntity<?> verifyAdmin(@RequestBody Map<String, String> body) {
		String correo = "josepe@gmail.com";
		String clave = body.get("password");

		return authService.loginAdmin(correo, clave)
				.<ResponseEntity<?>>map(ResponseEntity::ok)
				.orElseGet(() -> ResponseEntity.status(401).build());
	}
}