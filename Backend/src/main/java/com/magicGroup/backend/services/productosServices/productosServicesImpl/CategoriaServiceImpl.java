/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */

package com.magicGroup.backend.services.productosServices.productosServicesImpl;

import com.magicGroup.backend.model.productos.Categoria;
import com.magicGroup.backend.repository.productosRepository.CategoriaRepository;
import com.magicGroup.backend.services.GenericServiceImpl;
import com.magicGroup.backend.services.productosServices.CategoriaService;
import org.springframework.stereotype.Service;
/**
 *
 * @author Jhonn
 */

@Service
public class CategoriaServiceImpl extends GenericServiceImpl<Categoria, Integer> implements CategoriaService {

    private final CategoriaRepository categoriaRepository;

    public CategoriaServiceImpl(CategoriaRepository categoriaRepository) {
        super(categoriaRepository);
        this.categoriaRepository = categoriaRepository;
    }

    @Override
    public Categoria buscarPorNombre(String nombre) {
        return categoriaRepository.findByNomCat(nombre);
    }
}