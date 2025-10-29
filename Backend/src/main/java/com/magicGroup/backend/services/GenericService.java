package com.magicGroup.backend.services;

import java.util.List;
import java.util.Optional;

/**
 *
 * @author Jhonn
 */

public interface GenericService<T, ID> {
    List<T> listarTodos();
    Optional<T> obtenerPorId(ID id);
    T guardar(T entidad);
    void eliminarPorId(ID id);
}
