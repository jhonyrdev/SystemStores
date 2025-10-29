package com.magicGroup.backend.model.ventas;

import com.magicGroup.backend.model.productos.Producto;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

/**
 *
 * @author Jhonn
 */
@Entity
@Table(name = "DetallePedido")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DetallePedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idDetalle;

    @ManyToOne
    @JoinColumn(name = "id_ped", nullable = false)
    private Pedido pedido;

    @ManyToOne
    @JoinColumn(name = "id_prod", nullable = false)
    private Producto producto;

    @Column(nullable = false)
    private Integer cantidad;

    @Column(nullable = false)
    private BigDecimal precioUnit;

    @Column(nullable = false)
    private BigDecimal subtotal;
}
