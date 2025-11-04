package com.magicGroup.backend.services.usuariosServices.usuariosServicesImpl;

import com.magicGroup.backend.model.usuarios.Administrador;
import com.magicGroup.backend.repository.usuariosRepository.AdministradorRepository;
import com.magicGroup.backend.services.GenericServiceImpl;
import com.magicGroup.backend.services.usuariosServices.AdministradorService;
import org.springframework.stereotype.Service;

@Service
public class AdministradorServiceImpl extends GenericServiceImpl<Administrador, Integer> implements AdministradorService {

    public AdministradorServiceImpl(AdministradorRepository repository) {
        super(repository);
    }
}