/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */

package com.magicGroup.backend.services.productosServices;

import com.magicGroup.backend.services.GenericService;
import com.magicGroup.backend.model.productos.SubCategoria;
import java.util.List;

/**
 *
 * @author Jhonn
 */
public interface SubCategoriaService extends GenericService<SubCategoria, Integer>{
    List<SubCategoria> listarPorCategoria(Integer idCat);

}
