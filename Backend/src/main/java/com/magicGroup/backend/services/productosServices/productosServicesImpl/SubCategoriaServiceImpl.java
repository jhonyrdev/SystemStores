/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */

package com.magicGroup.backend.services.productosServices.productosServicesImpl;

import com.magicGroup.backend.model.productos.SubCategoria;
import com.magicGroup.backend.repository.productosRepository.SubCategoriaRepository;
import com.magicGroup.backend.services.GenericServiceImpl;
import com.magicGroup.backend.services.productosServices.SubCategoriaService;
import org.springframework.stereotype.Service;
import java.util.List;

/* @author Jhonn */

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
