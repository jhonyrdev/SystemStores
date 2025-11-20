package com.magicGroup.backend.services.extrasServices;

import com.magicGroup.backend.model.usuarios.*;
import com.magicGroup.backend.repository.usuariosRepository.*;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.*;

import com.magicGroup.backend.services.usuariosServices.ClienteService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import org.springframework.dao.DataIntegrityViolationException;
import org.slf4j.*;

@Service
@RequiredArgsConstructor
public class AuthService {

	private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

	@Value("${google.client-id}")
	private String googleClientId;

	@Value("${google.client-secret}")
	private String googleClientSecret;

	@Value("${google.redirect-uri}")
	private String googleRedirectUri;

	private final ClienteRepository clienteRepository;
	private final AdministradorRepository administradorRepository;
	private final CredencialRepository credencialRepository;
	private final PasswordEncoder passwordEncoder;
	private final ClienteService clienteService;
	private final RegistroService registroService;
	private final PasswordResetTokenRepository passwordResetTokenRepository;
	private final EmailService emailService;

	private final RestTemplate restTemplate = new RestTemplate();

	public Map<String, Object> loginConGoogle(String code, String redirectUri) {

		HttpHeaders headers = new HttpHeaders();
		headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

		String params = "code=" + code +
				"&client_id=" + googleClientId +
				"&client_secret=" + googleClientSecret +
				"&redirect_uri=" + redirectUri +
				"&grant_type=authorization_code";

		HttpEntity<String> request = new HttpEntity<>(params, headers);

		ResponseEntity<Map<String, Object>> tokenResponse = restTemplate.exchange(
				"https://oauth2.googleapis.com/token",
				HttpMethod.POST,
				request,
				new ParameterizedTypeReference<Map<String, Object>>() {
				});

		Map<String, Object> tokenBody = tokenResponse.getBody();
		if (tokenBody == null || !tokenBody.containsKey("access_token")) {
			throw new RuntimeException("Error al obtener el token de Google");
		}

		String accessToken = (String) tokenBody.get("access_token");

		HttpHeaders userHeaders = new HttpHeaders();
		userHeaders.setBearerAuth(accessToken);
		HttpEntity<Void> userRequest = new HttpEntity<>(userHeaders);

		ResponseEntity<Map<String, Object>> userResponse = restTemplate.exchange(
				"https://www.googleapis.com/oauth2/v3/userinfo",
				HttpMethod.GET,
				userRequest,
				new ParameterizedTypeReference<Map<String, Object>>() {
				});

		Map<String, Object> userInfo = userResponse.getBody();
		if (userInfo == null) {
			throw new RuntimeException("No se pudo obtener la información del usuario de Google");
		}

		return userInfo;
	}

	@Transactional
	public Optional<Cliente> findOrCreateClienteByEmail(String email, Map<String, Object> googleUser,
			HttpServletRequest request) {

		if (email == null || email.isEmpty()) {
			throw new IllegalArgumentException("Email no puede ser nulo");
		}

		Object emailVerifiedObj = googleUser.get("email_verified");
		boolean emailVerified = emailVerifiedObj != null && Boolean.parseBoolean(emailVerifiedObj.toString());
		if (!emailVerified) {
			throw new RuntimeException("El email no está verificado por Google");
		}

		Optional<Cliente> clienteOpt = clienteRepository.findByCorreoCli(email);

		if (clienteOpt.isPresent()) {
			Cliente cliente = clienteOpt.get();

			if (cliente.getCredencial() != null && !esUsuarioGoogle(cliente.getCredencial())) {
				throw new RuntimeException(
						"Este correo ya está registrado con usuario y contraseña. " +
								"Por favor inicia sesión con tu usuario y contraseña.");
			}

			if (cliente.getEstado() != Cliente.Estado.activo) {
				clienteService.reactivarAlIniciarSesion(cliente.getIdCli());
			}

			UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(cliente, null,
					null);
			SecurityContextHolder.getContext().setAuthentication(authToken);
			request.getSession().setAttribute(
					HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY,
					SecurityContextHolder.getContext());

			return Optional.of(cliente);
		}

		// Crear nuevo cliente Google
		String nombreGoogle = (String) googleUser.get("given_name");
		String apellidoGoogle = (String) googleUser.get("family_name");

		String nombreBase = nombreGoogle != null && !nombreGoogle.isEmpty()
				? nombreGoogle.replaceAll("\\s+", "").toLowerCase()
				: email.split("@")[0];

		String usuarioBase = "cliG" + nombreBase;
		String usuarioCredencial = usuarioBase;
		int contador = 1;

		while (credencialRepository.findByUsuario(usuarioCredencial).isPresent()) {
			usuarioCredencial = usuarioBase + contador;
			contador++;
		}

		Credencial credencial = new Credencial();
		credencial.setUsuario(usuarioCredencial);
		credencial.setClave(passwordEncoder.encode(UUID.randomUUID().toString()));
		credencial.setRol(Credencial.Rol.cliente);

		// Guardar la credencial con reintentos en caso de colisión de clave única
		// (usuario)
		int guardarIntentos = 0;
		final int MAX_INTENTOS = 5;
		while (true) {
			try {
				credencial = credencialRepository.saveAndFlush(credencial);
				break;
			} catch (DataIntegrityViolationException dive) {
				guardarIntentos++;
				logger.warn("Fallo al guardar Credencial con usuario='{}'. Intento {}/{}. Error: {}",
						usuarioCredencial, guardarIntentos, MAX_INTENTOS, dive.getMessage());
				if (guardarIntentos >= MAX_INTENTOS) {
					throw new RuntimeException("No se pudo generar un usuario único para la credencial después de "
							+ MAX_INTENTOS + " intentos", dive);
				}
				// generar nuevo usuario con sufijo incremental
				usuarioCredencial = usuarioBase + contador;
				contador++;
				credencial.setUsuario(usuarioCredencial);
				// y volver a intentar
			}
		}

		Cliente cliente = new Cliente();
		cliente.setCodCli(registroService.generarCodigoClienteUnico());
		cliente.setNomCli(nombreGoogle != null && !nombreGoogle.isEmpty() ? nombreGoogle : "Usuario");
		cliente.setApeCli(apellidoGoogle != null && !apellidoGoogle.isEmpty() ? apellidoGoogle : "");
		cliente.setCorreoCli(email);
		cliente.setTelCli("");
		cliente.setEstado(Cliente.Estado.activo);
		cliente.setFechaReg(LocalDate.now());
		cliente.setCredencial(credencial);
		cliente = clienteRepository.saveAndFlush(cliente);

		UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(cliente, null, null);
		SecurityContextHolder.getContext().setAuthentication(authToken);
		request.getSession().setAttribute(
				HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY,
				SecurityContextHolder.getContext());

		return Optional.of(cliente);
	}

	// Agregar este método al final de la clase
	public boolean esUsuarioGoogle(Credencial credencial) {
		return credencial != null &&
				credencial.getUsuario() != null &&
				credencial.getUsuario().startsWith("cliG");
	}

	private boolean isHashed(String password) {
		return password != null && password.startsWith("$2a$");
	}

	@SuppressWarnings("unused")
	private String ensureHashed(String password) {
		return isHashed(password) ? password : passwordEncoder.encode(password);
	}

	public Optional<Cliente> loginCliente(String identificador, String claveIngresada, HttpServletRequest request) {
		Optional<Cliente> clienteOpt = clienteRepository.findByCorreoCli(identificador);

		if (clienteOpt.isEmpty()) {
			Optional<Credencial> credOpt = credencialRepository.findByUsuario(identificador);
			if (credOpt.isPresent()) {
				Credencial cred = credOpt.get();

				// Verificar que NO sea usuario de Google
				if (esUsuarioGoogle(cred)) {
					throw new RuntimeException(
							"Este usuario fue creado con Google. Por favor inicia sesión con Google.");
				}

				if (!isHashed(cred.getClave())) {
					cred.setClave(passwordEncoder.encode(cred.getClave()));
					credencialRepository.save(cred);
				}

				Optional<Cliente> clienteEncontrado = clienteRepository.findAll().stream()
						.filter(c -> c.getCredencial() != null)
						.filter(c -> c.getCredencial().getIdCred().equals(cred.getIdCred()) &&
								c.getEstado() == Cliente.Estado.activo &&
								cred.getClave() != null &&
								passwordEncoder.matches(claveIngresada, cred.getClave()))
						.findFirst();

				clienteEncontrado.ifPresent(cliente -> {
					clienteService.reactivarAlIniciarSesion(cliente.getIdCli());

					UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(cliente,
							null, null);
					SecurityContextHolder.getContext().setAuthentication(authToken);
					request.getSession().setAttribute(
							HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY,
							SecurityContextHolder.getContext());
				});

				return clienteEncontrado;
			}
			return Optional.empty();
		}

		Cliente cliente = clienteOpt.get();
		Credencial cred = cliente.getCredencial();

		// Verificar que NO sea usuario de Google
		if (esUsuarioGoogle(cred)) {
			throw new RuntimeException("Este usuario fue creado con Google. Por favor inicia sesión con Google.");
		}

		if (!isHashed(cred.getClave())) {
			cred.setClave(passwordEncoder.encode(cred.getClave()));
			credencialRepository.save(cred);
		}

		if (cliente.getEstado() == Cliente.Estado.activo &&
				passwordEncoder.matches(claveIngresada, cred.getClave())) {

			clienteService.reactivarAlIniciarSesion(cliente.getIdCli());

			UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(cliente, null,
					null);
			SecurityContextHolder.getContext().setAuthentication(authToken);
			request.getSession().setAttribute(
					HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY,
					SecurityContextHolder.getContext());

			return Optional.of(cliente);
		}

		return Optional.empty();
	}

	// Login Admin (solo correo)
	public Optional<Administrador> loginAdmin(String correo, String claveIngresada) {
		Optional<Administrador> adminOpt = administradorRepository.findByCorreoAdmin(correo);
		if (adminOpt.isEmpty())
			return Optional.empty();

		Administrador admin = adminOpt.get();
		Credencial cred = admin.getCredencial();

		if (!isHashed(cred.getClave())) {
			cred.setClave(passwordEncoder.encode(cred.getClave()));
			credencialRepository.save(cred);
		}

		if (passwordEncoder.matches(claveIngresada, cred.getClave())) {
			return Optional.of(admin);
		}

		return Optional.empty();
	}

	// Solicitar recuperación de contraseña
	@Transactional
	public void solicitarRecuperacionContrasena(String email) {
		Optional<Cliente> clienteOpt = clienteRepository.findByCorreoCli(email);
		
		if (clienteOpt.isEmpty()) {
			// Por seguridad, no revelamos si el email existe o no
			logger.warn("Solicitud de recuperación para email no registrado: {}", email);
			return;
		}

		Cliente cliente = clienteOpt.get();
		
		// Verificar que no sea usuario de Google
		if (esUsuarioGoogle(cliente.getCredencial())) {
			throw new RuntimeException("Este usuario fue creado con Google. No puede restablecer contraseña.");
		}

		// Eliminar tokens anteriores del cliente
		passwordResetTokenRepository.deleteByCliente(cliente);

		// Generar nuevo token
		String token = UUID.randomUUID().toString();
		PasswordResetToken resetToken = new PasswordResetToken();
		resetToken.setToken(token);
		resetToken.setCliente(cliente);
		resetToken.setExpiryDate(LocalDateTime.now().plusHours(1)); // Token válido por 1 hora
		resetToken.setUsado(false);
		
		passwordResetTokenRepository.save(resetToken);

		// Enviar email
		emailService.sendPasswordResetEmail(email, token);
		logger.info("Token de recuperación generado para cliente: {}", cliente.getIdCli());
	}

	// Restablecer contraseña con token
	@Transactional
	public void restablecerContrasena(String token, String nuevaContrasena) {
		Optional<PasswordResetToken> tokenOpt = passwordResetTokenRepository.findByToken(token);
		
		if (tokenOpt.isEmpty()) {
			throw new RuntimeException("Token inválido");
		}

		PasswordResetToken resetToken = tokenOpt.get();

		if (resetToken.isUsado()) {
			throw new RuntimeException("Este token ya fue utilizado");
		}

		if (resetToken.isExpired()) {
			throw new RuntimeException("El token ha expirado");
		}

		Cliente cliente = resetToken.getCliente();
		Credencial credencial = cliente.getCredencial();

		// Actualizar contraseña
		credencial.setClave(passwordEncoder.encode(nuevaContrasena));
		credencialRepository.save(credencial);

		// Marcar token como usado
		resetToken.setUsado(true);
		passwordResetTokenRepository.save(resetToken);

		logger.info("Contraseña restablecida exitosamente para cliente: {}", cliente.getIdCli());
	}
}
