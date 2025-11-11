package com.magicGroup.backend.model.ventas;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.magicGroup.backend.model.productos.Producto;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

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
    @JsonIgnoreProperties({"detallePedidos", "cliente", "direccion"})
    private Pedido pedido;

    @ManyToOne
    @JoinColumn(name = "id_prod", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Producto producto;

    @Column(nullable = false)
    private Integer cantidad;

    @Column(nullable = false)
    private BigDecimal precioUnit;

    @Column(nullable = false)
    private BigDecimal subtotal;
}
