package com.magicGroup.backend.repository.productosRepository;

import com.magicGroup.backend.model.productos.Producto;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProductoRepository extends JpaRepository<Producto, Integer> {

    @Query("SELECT DISTINCT p FROM Producto p " +
            "LEFT JOIN FETCH p.subcategoria sc " +
            "LEFT JOIN FETCH sc.categoria")
    List<Producto> findAllWithRelations();

    int countBySubcategoria_Categoria_NomCat(String nomCat);

    List<Producto> findByCodProdStartingWithOrderByCodProdDesc(String prefijo);

    @Modifying
    @Query("UPDATE Producto p SET p.cantProd = p.cantProd + :delta WHERE p.idProd = :id")
    int adjustStock(@Param("id") Integer id, @Param("delta") Integer delta);
}