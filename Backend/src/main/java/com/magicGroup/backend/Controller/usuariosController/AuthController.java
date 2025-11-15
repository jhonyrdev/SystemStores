package com.magicGroup.backend.Controller.usuariosController;

import com.magicGroup.backend.model.usuarios.Cliente;
import com.magicGroup.backend.services.extrasServices.AuthService;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.slf4j.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;
import lombok.*;

import java.util.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class AuthController {

	private final AuthService authService;
	private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

	// Login Cliente
	@PostMapping("/loginCliente")
	public ResponseEntity<?> loginCliente(@RequestBody Map<String, String> body, HttpServletRequest request) {
		String identificador = body.get("identificador");
		String clave = body.get("clave");

		try {
			return authService.loginCliente(identificador, clave, request)
					.<ResponseEntity<?>>map(cliente -> {
						Map<String, String> response = new HashMap<>();
						response.put("message", "Login exitoso");
						return ResponseEntity.ok(response);
					})
					.orElseGet(() -> ResponseEntity.status(401).build());
		} catch (RuntimeException e) {
			Map<String, String> error = new HashMap<>();
			error.put("error", e.getMessage());
			return ResponseEntity.status(400).body(error);
		}
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

	@PostMapping("/google-login")
	public ResponseEntity<?> loginConGoogle(@RequestBody Map<String, String> body, HttpServletRequest request) {
		String code = body.get("code");
		String redirectUri = "http://localhost:5173/auth/callback";

		try {
			Map<String, Object> googleUser = authService.loginConGoogle(code, redirectUri);

			String email = (String) googleUser.get("email");

			Optional<Cliente> clienteOpt = authService.findOrCreateClienteByEmail(email, googleUser, request);

			if (clienteOpt.isPresent()) {
				Cliente cliente = clienteOpt.get();
				Map<String, Object> response = new HashMap<>();
				response.put("message", "Login exitoso con Google");
				response.put("cliente", cliente);
				return ResponseEntity.ok(response);
			} else {
				return ResponseEntity.status(401).body("No se pudo autenticar al usuario");
			}
		} catch (IllegalArgumentException e) {
			logger.warn("Bad request en loginConGoogle: {}", e.getMessage());
			return ResponseEntity.status(400).body("Error: " + e.getMessage());
		} catch (Exception e) {
			// Loggear stacktrace completo para depuración (evita ocultar la causa real)
			logger.error("Error en el proceso de autenticación con Google", e);
			return ResponseEntity.status(500)
					.body("Error en el proceso de autenticación: " + e.getMessage());
		}
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
