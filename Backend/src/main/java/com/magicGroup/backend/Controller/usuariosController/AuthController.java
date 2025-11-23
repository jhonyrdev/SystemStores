package com.magicGroup.backend.Controller.usuariosController;

import com.magicGroup.backend.model.usuarios.Cliente;
import com.magicGroup.backend.services.extrasServices.AuthService;
import com.magicGroup.backend.repository.usuariosRepository.CredencialRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
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
public class AuthController {

	private final AuthService authService;
	private final CredencialRepository credencialRepository;
	private final PasswordEncoder passwordEncoder;
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

	@PostMapping("/cambiar-clave")
	public ResponseEntity<?> cambiarClave(@RequestBody Map<String, String> body, Authentication authentication) {
		if (authentication == null || !(authentication.getPrincipal() instanceof Cliente cliente)) {
			return ResponseEntity.status(401).body(Map.of("error", "No autenticado"));
		}

		String claveActual = body.getOrDefault("claveActual", "");
		String nuevaClave = body.getOrDefault("nuevaClave", "");
		String repetirClave = body.getOrDefault("repetirClave", "");

		try {
			if (claveActual.isBlank() || nuevaClave.isBlank() || repetirClave.isBlank()) {
				throw new IllegalArgumentException("Todos los campos son obligatorios");
			}
			if (!nuevaClave.equals(repetirClave)) {
				throw new IllegalArgumentException("La nueva contraseña y su confirmación no coinciden");
			}
			if (nuevaClave.length() < 8) {
				throw new IllegalArgumentException("La nueva contraseña debe tener al menos 8 caracteres");
			}
			if (nuevaClave.equals(claveActual)) {
				throw new IllegalArgumentException("La nueva contraseña debe ser diferente a la actual");
			}
			// Reglas básicas: al menos una letra y un número
			if (!nuevaClave.matches(".*[A-Za-z].*") || !nuevaClave.matches(".*[0-9].*")) {
				throw new IllegalArgumentException("La contraseña debe contener letras y números");
			}

			var cred = cliente.getCredencial();
			if (cred == null) {
				return ResponseEntity.status(400).body(Map.of("error", "No se encontró credencial asociada"));
			}
			if (!passwordEncoder.matches(claveActual, cred.getClave())) {
				return ResponseEntity.status(400).body(Map.of("error", "La contraseña actual es incorrecta"));
			}

			cred.setClave(passwordEncoder.encode(nuevaClave));
			credencialRepository.save(cred);

			return ResponseEntity.ok(Map.of("message", "Contraseña actualizada correctamente"));
		} catch (IllegalArgumentException e) {
			return ResponseEntity.status(400).body(Map.of("error", e.getMessage()));
		} catch (Exception e) {
			return ResponseEntity.status(500).body(Map.of("error", "Error al cambiar la contraseña"));
		}
	}

	@PostMapping("/forgot-password")
	public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> body) {
		String email = body.get("email");

		if (email == null || email.isBlank()) {
			return ResponseEntity.status(400).body(Map.of("error", "Email es requerido"));
		}

		try {
			authService.solicitarRecuperacionContrasena(email);
			// Por seguridad, siempre devolvemos el mismo mensaje
			return ResponseEntity.ok(Map.of(
				"message", "Si el correo está registrado, recibirás un email con instrucciones para restablecer tu contraseña"
			));
		} catch (RuntimeException e) {
			// Si es usuario de Google, informamos específicamente
			if (e.getMessage().contains("Google")) {
				return ResponseEntity.status(400).body(Map.of("error", e.getMessage()));
			}
			// Para otros errores, mensaje genérico por seguridad
			return ResponseEntity.ok(Map.of(
				"message", "Si el correo está registrado, recibirás un email con instrucciones para restablecer tu contraseña"
			));
		}
	}

	@PostMapping("/reset-password")
	public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> body) {
		String token = body.get("token");
		String nuevaContrasena = body.get("nuevaContrasena");

		if (token == null || token.isBlank()) {
			return ResponseEntity.status(400).body(Map.of("error", "Token es requerido"));
		}

		if (nuevaContrasena == null || nuevaContrasena.isBlank()) {
			return ResponseEntity.status(400).body(Map.of("error", "Nueva contraseña es requerida"));
		}

		// Validaciones de la contraseña
		if (nuevaContrasena.length() < 8) {
			return ResponseEntity.status(400).body(Map.of("error", "La contraseña debe tener al menos 8 caracteres"));
		}

		if (!nuevaContrasena.matches(".*[A-Za-z].*") || !nuevaContrasena.matches(".*[0-9].*")) {
			return ResponseEntity.status(400).body(Map.of("error", "La contraseña debe contener letras y números"));
		}

		try {
			authService.restablecerContrasena(token, nuevaContrasena);
			return ResponseEntity.ok(Map.of("message", "Contraseña restablecida exitosamente"));
		} catch (RuntimeException e) {
			return ResponseEntity.status(400).body(Map.of("error", e.getMessage()));
		}
	}
}
