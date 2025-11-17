package com.magicGroup.backend.repository.ventasRepository;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import com.magicGroup.backend.model.ventas.DetalleVenta;
import java.util.List;

public interface DetalleVentaRepository extends JpaRepository<DetalleVenta, Integer> {

    interface ProductoVentaProjection {
        Integer getIdProd();

        String getNomProd();

        Long getCantidad();
    }

    interface CategoriaVentaProjection {
        String getNomCat();

        Long getCantidad();
    }

    interface ClienteVentaProjection {
        Integer getIdCli();

        String getNomCli();

        String getApeCli();

        Long getCantidad();
    }

    @Query("SELECT dv.producto.idProd AS idProd, dv.nomProd AS nomProd, SUM(dv.cantidad) AS cantidad " +
            "FROM DetalleVenta dv GROUP BY dv.producto.idProd, dv.nomProd ORDER BY SUM(dv.cantidad) DESC")
    List<ProductoVentaProjection> findTopProductos(Pageable pageable);

    @Query("SELECT dv.producto.subcategoria.categoria.nomCat AS nomCat, SUM(dv.cantidad) AS cantidad " +
            "FROM DetalleVenta dv GROUP BY dv.producto.subcategoria.categoria.nomCat ORDER BY SUM(dv.cantidad) DESC")
    List<CategoriaVentaProjection> findTopCategorias(Pageable pageable);

    @Query("SELECT dv.venta.cliente.idCli AS idCli, dv.venta.cliente.nomCli AS nomCli, dv.venta.cliente.apeCli AS apeCli, SUM(dv.cantidad) AS cantidad "
            +
            "FROM DetalleVenta dv GROUP BY dv.venta.cliente.idCli, dv.venta.cliente.nomCli, dv.venta.cliente.apeCli ORDER BY SUM(dv.cantidad) DESC")
    List<ClienteVentaProjection> findTopClientes(Pageable pageable);
}
