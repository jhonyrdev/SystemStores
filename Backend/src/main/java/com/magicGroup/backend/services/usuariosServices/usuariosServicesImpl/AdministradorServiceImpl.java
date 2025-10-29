/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */

package com.magicGroup.backend.services.usuariosServices.usuariosServicesImpl;


import com.magicGroup.backend.model.usuarios.Administrador;
import com.magicGroup.backend.repository.usuariosRepository.AdministradorRepository;
import com.magicGroup.backend.services.GenericServiceImpl;
import com.magicGroup.backend.services.usuariosServices.AdministradorService;
import org.springframework.stereotype.Service;

/**
 *
 * @author Jhonn
 */

@Service
public class AdministradorServiceImpl extends GenericServiceImpl<Administrador, Integer> implements AdministradorService {

    public AdministradorServiceImpl(AdministradorRepository repository) {
        super(repository);
    }
}