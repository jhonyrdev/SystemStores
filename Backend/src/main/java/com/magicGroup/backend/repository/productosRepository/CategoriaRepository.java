package com.magicGroup.backend.repository.productosRepository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.magicGroup.backend.model.productos.Categoria;
import java.util.Optional;

public interface CategoriaRepository extends JpaRepository<Categoria, Integer> {
    Categoria findByNomCat(String nombre);
    
    Optional<Categoria> findByNomCatIgnoreCase(String nombre);
    boolean existsByNomCat(String nombre);
}

