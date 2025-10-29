/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */

package com.magicGroup.backend.repository.productosRepository;

import com.magicGroup.backend.model.productos.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

/**
 *
 * @author Jhonn
 */

public interface ProductoRepository extends JpaRepository<Producto, Integer> {
    int countBySubcategoria_Categoria_NomCat(String nomCat);
    List<Producto> findByCodProdStartingWithOrderByCodProdDesc(String prefijo);
}