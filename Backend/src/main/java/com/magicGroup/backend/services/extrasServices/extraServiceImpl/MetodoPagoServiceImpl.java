
package com.magicGroup.backend.services.extrasServices.extraServiceImpl;

import com.magicGroup.backend.model.extras.MetodoPago;
import com.magicGroup.backend.repository.extrasRepository.MetodoPagoRepository;
import com.magicGroup.backend.services.GenericServiceImpl;
import com.magicGroup.backend.services.extrasServices.MetodoPagoService;
import org.springframework.stereotype.Service;

@Service
public class MetodoPagoServiceImpl extends GenericServiceImpl<MetodoPago, Integer> implements MetodoPagoService {

    public MetodoPagoServiceImpl(MetodoPagoRepository repository) {
        super(repository);
    }
}

