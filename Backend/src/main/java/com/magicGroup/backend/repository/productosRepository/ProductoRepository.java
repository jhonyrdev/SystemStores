package com.magicGroup.backend.repository.productosRepository;

import com.magicGroup.backend.model.productos.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProductoRepository extends JpaRepository<Producto, Integer> {
    int countBySubcategoria_Categoria_NomCat(String nomCat);
    List<Producto> findByCodProdStartingWithOrderByCodProdDesc(String prefijo);
}