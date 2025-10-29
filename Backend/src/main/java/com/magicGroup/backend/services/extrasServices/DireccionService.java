package com.magicGroup.backend.services.extrasServices;

import com.magicGroup.backend.model.extras.Direccion;
import com.magicGroup.backend.services.GenericService;

import java.util.*;

/* @author Jhonn */

public interface DireccionService extends GenericService<Direccion, Integer> {

    List<Map<String, Object>> obtenerDireccionesPorCliente(Integer idCli);

    boolean estaEnUso(Integer idDir);
}
