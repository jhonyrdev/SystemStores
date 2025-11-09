package com.magicGroup.backend.services.usuariosServices.usuariosServicesImpl;


import com.magicGroup.backend.model.usuarios.Credencial;
import com.magicGroup.backend.repository.usuariosRepository.CredencialRepository;
import com.magicGroup.backend.services.GenericServiceImpl;
import com.magicGroup.backend.services.usuariosServices.CredencialService;
import org.springframework.stereotype.Service;

@Service
public class CredencialServiceImpl extends GenericServiceImpl<Credencial, Integer> implements CredencialService {

    public CredencialServiceImpl(CredencialRepository repository) {
        super(repository);
    }
}
