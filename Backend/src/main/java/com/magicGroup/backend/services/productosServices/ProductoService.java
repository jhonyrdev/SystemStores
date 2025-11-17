package com.magicGroup.backend.services.productosServices;

import com.magicGroup.backend.services.GenericService;

import java.util.List;

import com.magicGroup.backend.model.productos.Producto;

public interface ProductoService extends GenericService<Producto, Integer> {
    String generarCodigo(String nombreCategoria);

    int contarPorCategoria(String nombreCategoria);

    String obtenerUltimoCodigoPorCategoria(String prefijo);

    List<Producto> listarTodosConRelaciones();

    // Ajustar stock de forma atómica
    void increaseStock(Integer idProd, int cantidad);

}
