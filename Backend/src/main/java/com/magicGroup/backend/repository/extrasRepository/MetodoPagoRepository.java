package com.magicGroup.backend.repository.extrasRepository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.magicGroup.backend.model.extras.MetodoPago;

public interface MetodoPagoRepository extends JpaRepository<MetodoPago, Integer> {
}