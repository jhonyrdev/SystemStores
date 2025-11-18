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

	// Exclude ventas linked to pedidos with estado 'Rechazado' so rejected orders
	// are not counted
	@Query("SELECT v.cliente.idCli AS idCli, SUM(v.total) AS totalGastado FROM Venta v " +
			"WHERE v.pedido IS NULL OR v.pedido.estado <> 'Rechazado' GROUP BY v.cliente.idCli")
	List<ClienteGastoProjection> obtenerGastosPorCliente();

	// Find venta by its linked pedido id (optional)
	java.util.Optional<Venta> findByPedido_IdPed(Integer idPed);
}
