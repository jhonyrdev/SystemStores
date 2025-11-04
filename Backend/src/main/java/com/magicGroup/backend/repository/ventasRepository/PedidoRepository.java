package com.magicGroup.backend.repository.ventasRepository;

import com.magicGroup.backend.model.ventas.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.Query;
import java.time.LocalDate;

public interface PedidoRepository extends JpaRepository<Pedido, Integer> {

    @Query("SELECT MAX(p.fecha) FROM Pedido p WHERE p.cliente.idCli = :clienteId")
    LocalDate encontrarUltimaFechaPedido(@Param("clienteId") Integer clienteId);

    @Query("SELECT CASE WHEN COUNT(p) > 0 THEN true ELSE false END FROM Pedido p WHERE p.cliente.idCli = :clienteId")
    boolean clienteTienePedidos(@Param("clienteId") Integer clienteId);

}
