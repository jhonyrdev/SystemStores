package com.magicGroup.backend.services;

import java.util.*;

public interface GenericService<T, ID> {
    List<T> listarTodos();
    Optional<T> obtenerPorId(ID id);
    T guardar(T entidad);
    void eliminarPorId(ID id);
}
