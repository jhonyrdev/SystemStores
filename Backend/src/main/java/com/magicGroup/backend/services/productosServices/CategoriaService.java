/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */

package com.magicGroup.backend.services.productosServices;

import com.magicGroup.backend.services.GenericService;
import com.magicGroup.backend.model.productos.Categoria;

/**
 *
 * @author Jhonn
 */

public interface CategoriaService extends GenericService<Categoria, Integer> {
    Categoria buscarPorNombre(String nombre);
}
