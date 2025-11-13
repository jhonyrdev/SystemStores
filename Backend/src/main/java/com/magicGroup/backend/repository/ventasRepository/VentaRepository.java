package com.magicGroup.backend.repository.ventasRepository;

import com.magicGroup.backend.model.ventas.Venta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.math.BigDecimal;
import java.util.List;

public interface VentaRepository extends JpaRepository<Venta, Integer> {

	interface ClienteGastoProjection {
		Integer getIdCli();
		BigDecimal getTotalGastado();
	}

	@Query("SELECT v.cliente.idCli AS idCli, SUM(v.total) AS totalGastado FROM Venta v GROUP BY v.cliente.idCli")
	List<ClienteGastoProjection> obtenerGastosPorCliente();
}
