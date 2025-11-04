package com.magicGroup.backend.services.productosServices.productosServicesImpl;

import com.magicGroup.backend.model.productos.SubCategoria;
import com.magicGroup.backend.repository.productosRepository.SubCategoriaRepository;
import com.magicGroup.backend.services.GenericServiceImpl;
import com.magicGroup.backend.services.productosServices.SubCategoriaService;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class SubCategoriaServiceImpl extends GenericServiceImpl<SubCategoria, Integer> implements SubCategoriaService {

    private final SubCategoriaRepository repo;

    public SubCategoriaServiceImpl(SubCategoriaRepository repo) {
        super(repo);
        this.repo = repo;
    }
    
    @Override
    public List<SubCategoria> listarPorCategoria(Integer idCat) {
        return repo.findByCategoriaIdCat(idCat);
}

}
