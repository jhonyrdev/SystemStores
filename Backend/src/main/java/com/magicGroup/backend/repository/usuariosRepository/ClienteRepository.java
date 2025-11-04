package com.magicGroup.backend.repository.usuariosRepository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.magicGroup.backend.model.usuarios.Cliente;
import java.util.Optional;

public interface ClienteRepository extends JpaRepository<Cliente, Integer> {
     Optional<Cliente> findByCorreoCli(String correoCli);
}
