package com.magicGroup.backend.repository.usuariosRepository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.magicGroup.backend.model.usuarios.Administrador;
import java.util.Optional;

public interface AdministradorRepository extends JpaRepository<Administrador, Integer> {
    Optional<Administrador> findByCorreoAdmin(String correoAdmin);
}

