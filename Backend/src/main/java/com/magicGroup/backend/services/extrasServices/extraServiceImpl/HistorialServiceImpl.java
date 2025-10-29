/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */

package com.magicGroup.backend.services.extrasServices.extraServiceImpl;

import com.magicGroup.backend.model.extras.Historial;
import com.magicGroup.backend.repository.extrasRepository.HistorialRepository;
import com.magicGroup.backend.services.GenericServiceImpl;
import com.magicGroup.backend.services.extrasServices.HistorialService;
import org.springframework.stereotype.Service;

/**
 *
 * @author Jhonn
 */

@Service
public class HistorialServiceImpl extends GenericServiceImpl<Historial, Integer> implements HistorialService {

    public HistorialServiceImpl(HistorialRepository repository) {
        super(repository);
    }
}

