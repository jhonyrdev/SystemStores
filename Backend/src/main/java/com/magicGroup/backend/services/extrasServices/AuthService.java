package com.magicGroup.backend.services.extrasServices;

import com.magicGroup.backend.model.usuarios.*;
import com.magicGroup.backend.repository.usuariosRepository.*;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.scheduling.annotation.Async;
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

import java.time.*;
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
				new ParameterizedTypeReference<>() {
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
				new ParameterizedTypeReference<>() {
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
		if (email == null || email.isEmpty())
			throw new IllegalArgumentException("Email no puede ser nulo");

		boolean emailVerified = Boolean.parseBoolean(String.valueOf(googleUser.getOrDefault("email_verified", false)));
		if (!emailVerified)
			throw new RuntimeException("El email no está verificado por Google");

		Optional<Cliente> clienteOpt = clienteRepository.findByCorreoCli(email);

		if (clienteOpt.isPresent()) {
			Cliente cliente = clienteOpt.get();

			if (cliente.getCredencial() != null && !esUsuarioGoogle(cliente.getCredencial()))
				throw new RuntimeException("Correo ya registrado con usuario/contraseña");

			if (cliente.getEstado() != Cliente.Estado.activo)
				clienteService.reactivarAlIniciarSesion(cliente.getIdCli());

			autenticarCliente(cliente, request);
			return Optional.of(cliente);
		}

		Cliente cliente = crearClienteGoogle(email, googleUser);
		autenticarCliente(cliente, request);
		return Optional.of(cliente);
	}

	private void autenticarCliente(Cliente cliente, HttpServletRequest request) {
		UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(cliente, null, null);
		SecurityContextHolder.getContext().setAuthentication(authToken);
		request.getSession().setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY,
				SecurityContextHolder.getContext());
	}

	private Cliente crearClienteGoogle(String email, Map<String, Object> googleUser) {
		String nombreGoogle = (String) googleUser.get("given_name");
		String apellidoGoogle = (String) googleUser.get("family_name");

		String nombreBase = (nombreGoogle != null && !nombreGoogle.isEmpty())
				? nombreGoogle.replaceAll("\\s+", "").toLowerCase()
				: email.split("@")[0];

		String usuarioBase = "cliG" + nombreBase;
		String usuarioCredencial = usuarioBase;
		int contador = 1;

		while (credencialRepository.findByUsuario(usuarioCredencial).isPresent()) {
			usuarioCredencial = usuarioBase + contador++;
		}

		Credencial credencial = new Credencial();
		credencial.setUsuario(usuarioCredencial);
		credencial.setClave(passwordEncoder.encode(UUID.randomUUID().toString()));
		credencial.setRol(Credencial.Rol.cliente);

		int guardarIntentos = 0;
		final int MAX_INTENTOS = 5;
		while (true) {
			try {
				credencial = credencialRepository.saveAndFlush(credencial);
				break;
			} catch (DataIntegrityViolationException dive) {
				if (++guardarIntentos >= MAX_INTENTOS)
					throw new RuntimeException("No se pudo generar usuario único para credencial", dive);
				credencial.setUsuario(usuarioBase + contador++);
			}
		}

		Cliente cliente = new Cliente();
		cliente.setCodCli(registroService.generarCodigoClienteUnico());
		cliente.setNomCli(nombreGoogle != null ? nombreGoogle : "Usuario");
		cliente.setApeCli(apellidoGoogle != null ? apellidoGoogle : "");
		cliente.setCorreoCli(email);
		cliente.setTelCli("");
		cliente.setEstado(Cliente.Estado.activo);
		cliente.setFechaReg(LocalDate.now());
		cliente.setCredencial(credencial);

		return clienteRepository.saveAndFlush(cliente);
	}

	public Optional<Cliente> loginCliente(String identificador, String claveIngresada, HttpServletRequest request) {
		Optional<Cliente> clienteOpt = clienteRepository.findByCorreoCli(identificador);

		if (clienteOpt.isEmpty()) {
			return loginPorUsuario(identificador, claveIngresada, request);
		}

		Cliente cliente = clienteOpt.get();
		Credencial cred = cliente.getCredencial();

		if (esUsuarioGoogle(cred))
			throw new RuntimeException("Este usuario fue creado con Google. Por favor inicia sesión con Google.");

		if (!isHashed(cred.getClave())) {
			cred.setClave(passwordEncoder.encode(cred.getClave()));
			credencialRepository.save(cred);
		}

		if (cliente.getEstado() == Cliente.Estado.activo &&
				passwordEncoder.matches(claveIngresada, cred.getClave())) {
			clienteService.reactivarAlIniciarSesion(cliente.getIdCli());
			autenticarCliente(cliente, request);
			return Optional.of(cliente);
		}

		return Optional.empty();
	}

	private Optional<Cliente> loginPorUsuario(String usuario, String clave, HttpServletRequest request) {
		Optional<Credencial> credOpt = credencialRepository.findByUsuario(usuario);
		if (credOpt.isEmpty())
			return Optional.empty();

		Credencial cred = credOpt.get();
		if (esUsuarioGoogle(cred))
			throw new RuntimeException("Usuario creado con Google");

		if (!isHashed(cred.getClave())) {
			cred.setClave(passwordEncoder.encode(cred.getClave()));
			credencialRepository.save(cred);
		}

		Optional<Cliente> clienteEncontrado = clienteRepository.findAll().stream()
				.filter(c -> c.getCredencial() != null)
				.filter(c -> c.getCredencial().getIdCred().equals(cred.getIdCred())
						&& c.getEstado() == Cliente.Estado.activo
						&& passwordEncoder.matches(clave, cred.getClave()))
				.findFirst();

		clienteEncontrado.ifPresent(c -> {
			clienteService.reactivarAlIniciarSesion(c.getIdCli());
			autenticarCliente(c, request);
		});

		return clienteEncontrado;
	}

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

		return passwordEncoder.matches(claveIngresada, cred.getClave())
				? Optional.of(admin)
				: Optional.empty();
	}

	@Transactional
	public void solicitarRecuperacionContrasena(String email) {
		Optional<Cliente> clienteOpt = clienteRepository.findByCorreoCli(email);
		if (clienteOpt.isEmpty()) {
			logger.warn("Solicitud de recuperación para email no registrado: {}", email);
			return;
		}

		Cliente cliente = clienteOpt.get();
		if (esUsuarioGoogle(cliente.getCredencial()))
			throw new RuntimeException("Este usuario fue creado con Google. No puede restablecer contraseña.");

		passwordResetTokenRepository.deleteByCliente(cliente);

		PasswordResetToken resetToken = new PasswordResetToken();
		resetToken.setCliente(cliente);
		resetToken.setToken(UUID.randomUUID().toString());
		resetToken.setExpiryDate(LocalDateTime.now().plusHours(1));
		resetToken.setUsado(false);

		passwordResetTokenRepository.save(resetToken);
		enviarCorreoAsync(email, resetToken.getToken());
	}

	@Async
	public void enviarCorreoAsync(String email, String token) {
		emailService.sendPasswordResetEmail(email, token);
	}

	@Transactional
	public void restablecerContrasena(String token, String nuevaContrasena) {
		PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(token)
				.orElseThrow(() -> new RuntimeException("Token inválido"));

		if (resetToken.isUsado())
			throw new RuntimeException("Este token ya fue utilizado");
		if (resetToken.isExpired())
			throw new RuntimeException("El token ha expirado");

		Cliente cliente = resetToken.getCliente();
		Credencial credencial = cliente.getCredencial();

		credencial.setClave(passwordEncoder.encode(nuevaContrasena));
		credencialRepository.save(credencial);

		resetToken.setUsado(true);
		passwordResetTokenRepository.save(resetToken);

		logger.info("Contraseña restablecida exitosamente para cliente: {}", cliente.getIdCli());
	}

	public boolean esUsuarioGoogle(Credencial credencial) {
		return credencial != null && credencial.getUsuario() != null && credencial.getUsuario().startsWith("cliG");
	}

	private boolean isHashed(String password) {
		return password != null && password.startsWith("$2a$");
	}

	@SuppressWarnings("unused")
	private String ensureHashed(String password) {
		return isHashed(password) ? password : passwordEncoder.encode(password);
	}

}
