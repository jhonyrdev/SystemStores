package com.magicGroup.backend.repository.extrasRepository;

import com.magicGroup.backend.model.extras.Direccion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.Query;
import java.util.*;

public interface DireccionRepository extends JpaRepository<Direccion, Integer> {
    
    List<Direccion> findByCliente_IdCli(Integer idCli);

    @Query(value = "CALL get_direcciones_cliente(:p_id_cli)", nativeQuery = true)
    List<Map<String, Object>> getDireccionesCliente(@Param("p_id_cli") Integer idCli);

}
