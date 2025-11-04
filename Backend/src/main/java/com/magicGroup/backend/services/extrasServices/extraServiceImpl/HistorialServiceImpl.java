package com.magicGroup.backend.services.extrasServices.extraServiceImpl;

import com.magicGroup.backend.model.extras.Historial;
import com.magicGroup.backend.repository.extrasRepository.HistorialRepository;
import com.magicGroup.backend.services.GenericServiceImpl;
import com.magicGroup.backend.services.extrasServices.HistorialService;
import org.springframework.stereotype.Service;

@Service
public class HistorialServiceImpl extends GenericServiceImpl<Historial, Integer> implements HistorialService {

    public HistorialServiceImpl(HistorialRepository repository) {
        super(repository);
    }
}

