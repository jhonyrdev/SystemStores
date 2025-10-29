/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */

package com.magicGroup.backend.repository.extrasRepository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.magicGroup.backend.model.extras.Historial;

/**
 *
 * @author Jhonn
 */

public interface HistorialRepository extends JpaRepository<Historial, Integer> {
}

