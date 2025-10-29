package com.magicGroup.backend.services;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
/**
 *
 * @author Jhonn
 */

@Transactional
public class GenericServiceImpl<T, ID> implements GenericService<T, ID> {

    protected final JpaRepository<T, ID> repository;

    public GenericServiceImpl(JpaRepository<T, ID> repository) {
        this.repository = repository;
    }

    @Override
    public List<T> listarTodos() {
        return repository.findAll();
    }

    @Override
    public Optional<T> obtenerPorId(ID id) {
        return repository.findById(id);
    }

    @Override
    public T guardar(T entidad) {
        return repository.save(entidad);
    }

    @Override
    public void eliminarPorId(ID id) {
        repository.deleteById(id);
    }
}