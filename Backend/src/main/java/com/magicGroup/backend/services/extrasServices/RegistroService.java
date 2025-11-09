package com.magicGroup.backend.services.extrasServices;

import com.magicGroup.backend.model.usuarios.*;
import com.magicGroup.backend.repository.usuariosRepository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.concurrent.atomic.AtomicInteger;

@Service
@RequiredArgsConstructor
public class RegistroService {

    private final ClienteRepository clienteRepository;
    private final CredencialRepository credencialRepository;
    private final PasswordEncoder passwordEncoder;

    private static final AtomicInteger SECUENCIA = new AtomicInteger(0);

    public String generarCodigoClienteUnico() {
        long tiempo = System.currentTimeMillis();
        int sec = SECUENCIA.getAndIncrement() % 10000;
        String numero = String.format("%013d%04d", tiempo, sec);
        return "CLI" + numero;
    }

    // Registrar nuevo cliente
    public Cliente registrarCliente(String nombre, String correo, String clave) {
        if (clienteRepository.findByCorreoCli(correo).isPresent()) {
            throw new RuntimeException("Correo ya registrado");
        }

        Credencial cred = new Credencial();
        cred.setUsuario("cli" + nombre);
        cred.setClave(passwordEncoder.encode(clave));
        cred.setRol(Credencial.Rol.cliente);
        cred = credencialRepository.save(cred);

        Cliente cliente = new Cliente();
        cliente.setCodCli(generarCodigoClienteUnico());
        cliente.setNomCli(nombre);
        cliente.setApeCli("");
        cliente.setCorreoCli(correo);
        cliente.setTelCli("");
        cliente.setEstado(Cliente.Estado.activo);
        cliente.setFechaReg(LocalDate.now());
        cliente.setCredencial(cred);

        return clienteRepository.save(cliente);
    }
}
