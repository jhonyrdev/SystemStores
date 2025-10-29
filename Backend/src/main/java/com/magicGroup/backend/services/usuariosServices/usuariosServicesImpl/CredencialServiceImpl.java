/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */

package com.magicGroup.backend.services.usuariosServices.usuariosServicesImpl;


import com.magicGroup.backend.model.usuarios.Credencial;
import com.magicGroup.backend.repository.usuariosRepository.CredencialRepository;
import com.magicGroup.backend.services.GenericServiceImpl;
import com.magicGroup.backend.services.usuariosServices.CredencialService;
import org.springframework.stereotype.Service;

/**
 *
 * @author Jhonn
 */

@Service
public class CredencialServiceImpl extends GenericServiceImpl<Credencial, Integer> implements CredencialService {

    public CredencialServiceImpl(CredencialRepository repository) {
        super(repository);
    }
}
