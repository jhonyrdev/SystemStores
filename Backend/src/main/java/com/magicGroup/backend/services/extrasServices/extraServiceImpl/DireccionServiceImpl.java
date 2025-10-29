package com.magicGroup.backend.services.extrasServices.extraServiceImpl;

import com.magicGroup.backend.model.extras.Direccion;
import com.magicGroup.backend.repository.extrasRepository.DireccionRepository;
import com.magicGroup.backend.services.GenericServiceImpl;
import com.magicGroup.backend.services.extrasServices.DireccionService;
import org.springframework.stereotype.Service;

import java.util.*;

/* @author Jhonn */

@Service
public class DireccionServiceImpl extends GenericServiceImpl<Direccion, Integer> implements DireccionService {

    private final DireccionRepository direccionRepository;

    public DireccionServiceImpl(DireccionRepository direccionRepository) {
        super(direccionRepository);
        this.direccionRepository = direccionRepository;
    }

    @Override
    public List<Map<String, Object>> obtenerDireccionesPorCliente(Integer idCli) {
        return direccionRepository.getDireccionesCliente(idCli);
    }

    @Override
    public boolean estaEnUso(Integer idDir) {
        List<Map<String, Object>> lista = 
                direccionRepository.getDireccionesCliente(0); 
        return lista.stream()
                .anyMatch(d -> d.get("id_dir").equals(idDir)
                        && ((Number) d.get("en_uso")).intValue() == 1);
    }
}
