/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */

package com.magicGroup.backend.services.extrasServices.extraServiceImpl;

/**
 *
 * @author Jhonn
 */


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

