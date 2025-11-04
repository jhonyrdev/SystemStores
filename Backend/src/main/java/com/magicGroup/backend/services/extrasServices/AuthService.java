/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */

package com.magicGroup.backend.services.extrasServices;

import com.magicGroup.backend.model.usuarios.*;
import com.magicGroup.backend.repository.usuariosRepository.*;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

import com.magicGroup.backend.services.usuariosServices.ClienteService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.Optional;


@Service
@RequiredArgsConstructor
public class AuthService {

    private final ClienteRepository clienteRepository;
    private final AdministradorRepository administradorRepository;
    private final CredencialRepository credencialRepository;
    private final PasswordEncoder passwordEncoder;
    private final ClienteService clienteService;

    // Verifica si la contraseña ya está hasheada
    private boolean isHashed(String password) {
        return password != null && password.startsWith("$2a$");
    }

    // Hashea si no está hasheada
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

			    if (!isHashed(cred.getClave())) {
				    cred.setClave(passwordEncoder.encode(cred.getClave()));
				    credencialRepository.save(cred);
			    }

			    Optional<Cliente> clienteEncontrado = clienteRepository.findAll().stream()
					    .filter(c -> c.getCredencial() != null)
					    .filter(c ->
							    c.getCredencial().getIdCred().equals(cred.getIdCred()) &&
									    c.getEstado() == Cliente.Estado.activo &&
									    cred.getClave() != null &&
									    passwordEncoder.matches(claveIngresada, cred.getClave())
					    )
					    .findFirst();

			    clienteEncontrado.ifPresent(cliente -> {
				    clienteService.reactivarAlIniciarSesion(cliente.getIdCli());

				    UsernamePasswordAuthenticationToken authToken =
						    new UsernamePasswordAuthenticationToken(cliente, null, null);
				    SecurityContextHolder.getContext().setAuthentication(authToken);
				    request.getSession().setAttribute(
						    HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY,
						    SecurityContextHolder.getContext()
				    );
			    });

			    return clienteEncontrado;
		    }
		    return Optional.empty();
	    }

	    Cliente cliente = clienteOpt.get();
	    Credencial cred = cliente.getCredencial();

	    if (!isHashed(cred.getClave())) {
		    cred.setClave(passwordEncoder.encode(cred.getClave()));
		    credencialRepository.save(cred);
	    }

	    if (cliente.getEstado() == Cliente.Estado.activo &&
			    passwordEncoder.matches(claveIngresada, cred.getClave())) {

		    clienteService.reactivarAlIniciarSesion(cliente.getIdCli());

		    UsernamePasswordAuthenticationToken authToken =
				    new UsernamePasswordAuthenticationToken(cliente, null, null);
		    SecurityContextHolder.getContext().setAuthentication(authToken);
		    request.getSession().setAttribute(
				    HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY,
				    SecurityContextHolder.getContext()
		    );

		    return Optional.of(cliente);
	    }

	    return Optional.empty();
    }

    // Login Admin (solo correo)
    public Optional<Administrador> loginAdmin(String correo, String claveIngresada) {
        Optional<Administrador> adminOpt = administradorRepository.findByCorreoAdmin(correo);
        if (adminOpt.isEmpty()) return Optional.empty();

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
}
