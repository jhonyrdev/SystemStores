/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */

package com.magicGroup.backend.repository.productosRepository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.magicGroup.backend.model.productos.Categoria;

import java.util.Optional;

/**
 *
 * @author Jhonn
 */

public interface CategoriaRepository extends JpaRepository<Categoria, Integer> {
    Categoria findByNomCat(String nombre);
    
    // Opcional: Buscar ignorando mayúsculas/minúsculas
    Optional<Categoria> findByNomCatIgnoreCase(String nombre);
    
    // Opcional: Verificar si existe una categoría con ese nombre
    boolean existsByNomCat(String nombre);
}

