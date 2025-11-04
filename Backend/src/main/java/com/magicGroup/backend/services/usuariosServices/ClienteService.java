package com.magicGroup.backend.services.usuariosServices;

import com.magicGroup.backend.model.usuarios.Cliente;
import com.magicGroup.backend.services.GenericService;

public interface ClienteService extends GenericService<Cliente, Integer> {
    void reactivarAlIniciarSesion(Integer clienteId);
}