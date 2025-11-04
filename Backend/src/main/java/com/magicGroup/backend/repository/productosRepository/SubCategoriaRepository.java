package com.magicGroup.backend.repository.productosRepository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.magicGroup.backend.model.productos.*;
import java.util.List;

public interface SubCategoriaRepository extends JpaRepository<SubCategoria, Integer> {
    List<SubCategoria> findByCategoriaIdCat(Integer idCat); 
}
