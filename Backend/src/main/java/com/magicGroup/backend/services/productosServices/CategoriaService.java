package com.magicGroup.backend.services.productosServices;

import com.magicGroup.backend.services.GenericService;
import com.magicGroup.backend.model.productos.Categoria;

public interface CategoriaService extends GenericService<Categoria, Integer> {
    Categoria buscarPorNombre(String nombre);
}
