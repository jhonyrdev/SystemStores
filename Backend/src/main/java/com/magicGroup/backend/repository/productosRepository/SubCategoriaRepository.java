/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */

package com.magicGroup.backend.repository.productosRepository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.magicGroup.backend.model.productos.*;
import java.util.List;

/**
 *
 * @author Jhonn
 */

public interface SubCategoriaRepository extends JpaRepository<SubCategoria, Integer> {
    List<SubCategoria> findByCategoriaIdCat(Integer idCat); 
}
