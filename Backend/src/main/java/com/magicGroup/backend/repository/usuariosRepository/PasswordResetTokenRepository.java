package com.magicGroup.backend.repository.usuariosRepository;

import com.magicGroup.backend.model.usuarios.PasswordResetToken;
import com.magicGroup.backend.model.usuarios.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Integer> {
    
    Optional<PasswordResetToken> findByToken(String token);
    
    Optional<PasswordResetToken> findByCliente(Cliente cliente);
    
    void deleteByExpiryDateBefore(LocalDateTime now);
    
    void deleteByCliente(Cliente cliente);
}
