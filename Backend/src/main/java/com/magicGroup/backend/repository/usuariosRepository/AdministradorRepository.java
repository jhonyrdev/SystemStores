/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */

package com.magicGroup.backend.repository.usuariosRepository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.magicGroup.backend.model.usuarios.Administrador;
import java.util.Optional;

/**
 *
 * @author Jhonn
 */

public interface AdministradorRepository extends JpaRepository<Administrador, Integer> {
    Optional<Administrador> findByCorreoAdmin(String correoAdmin);
}

