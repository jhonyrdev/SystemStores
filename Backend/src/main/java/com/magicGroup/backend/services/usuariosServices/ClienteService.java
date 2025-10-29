/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */

package com.magicGroup.backend.services.usuariosServices;

import com.magicGroup.backend.model.usuarios.Cliente;
import com.magicGroup.backend.services.GenericService;
/**
 *
 * @author Jhonn
 */

public interface ClienteService extends GenericService<Cliente, Integer> {
    void reactivarAlIniciarSesion(Integer clienteId);
}