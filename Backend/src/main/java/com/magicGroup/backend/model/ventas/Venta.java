package com.magicGroup.backend.model.ventas;

import com.magicGroup.backend.model.usuarios.Cliente;
import com.magicGroup.backend.model.extras.MetodoPago;
import jakarta.persistence.*;           
import lombok.*; 
import java.math.BigDecimal;
import java.time.*;

@Entity
@Table(name = "Venta")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Venta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idVenta;

    private LocalDate fecha;
    private LocalTime hora;

    @ManyToOne
    @JoinColumn(name = "id_cli", nullable = false)
    private Cliente cliente;

    @ManyToOne
    @JoinColumn(name = "id_ped")
    private Pedido pedido;

    @ManyToOne
    @JoinColumn(name = "id_metodo", nullable = false)
    private MetodoPago metodoPago;

    @Column(nullable = false)
    private BigDecimal total;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Tipo tipo;

    public enum Tipo {
        boleta, factura
    }
}
