/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */

package com.magicGroup.backend.repository.ventasRepository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.magicGroup.backend.model.ventas.Boleta;

/**
 *
 * @author Jhonn
 */

public interface BoletaRepository extends JpaRepository<Boleta, Integer> {
}

