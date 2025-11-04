package com.magicGroup.backend.repository.usuariosRepository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.magicGroup.backend.model.usuarios.Credencial;
import java.util.Optional;

public interface CredencialRepository extends JpaRepository<Credencial, Integer> {
    Optional<Credencial> findByUsuario(String usuario);
}
