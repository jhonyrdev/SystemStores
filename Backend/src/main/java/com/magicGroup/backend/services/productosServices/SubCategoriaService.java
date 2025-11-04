package com.magicGroup.backend.services.productosServices;

import com.magicGroup.backend.services.GenericService;
import com.magicGroup.backend.model.productos.SubCategoria;
import java.util.List;

public interface SubCategoriaService extends GenericService<SubCategoria, Integer>{
    List<SubCategoria> listarPorCategoria(Integer idCat);

}
