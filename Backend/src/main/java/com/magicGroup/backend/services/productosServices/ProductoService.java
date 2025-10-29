/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */

package com.magicGroup.backend.services.productosServices;

import com.magicGroup.backend.services.GenericService;
import com.magicGroup.backend.model.productos.Producto;

/* @author Jhonn */

public interface ProductoService extends GenericService<Producto, Integer> {
    String generarCodigo(String nombreCategoria);
    int contarPorCategoria(String nombreCategoria);
    String obtenerUltimoCodigoPorCategoria(String prefijo);
}

