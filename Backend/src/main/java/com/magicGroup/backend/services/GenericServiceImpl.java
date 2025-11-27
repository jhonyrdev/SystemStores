package com.magicGroup.backend.services;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;
import lombok.*;


@RequiredArgsConstructor
public class GenericServiceImpl<T, ID> implements GenericService<T, ID> {

    protected final JpaRepository<T, ID> repository;

    @Override
    @Transactional(readOnly = true)
    public List<T> listarTodos() {
        return repository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<T> obtenerPorId(ID id) {
        return repository.findById(id);
    }

    @Override
    @Transactional
    public T guardar(T entidad) {
        return repository.save(entidad);
    }

    @Override
    @Transactional
    public void eliminarPorId(ID id) {
        repository.deleteById(id);
    }
}