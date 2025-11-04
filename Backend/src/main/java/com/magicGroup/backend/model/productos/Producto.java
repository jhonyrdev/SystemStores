package com.magicGroup.backend.model.productos;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import com.fasterxml.jackson.annotation.*;

@Entity
@Table(name = "Producto")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Producto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_prod")
    private Integer idProd;

    @Column(name = "cod_prod", nullable = false, unique = true, length = 10)
    private String codProd;

    @Column(name = "nom_prod", nullable = false, length = 45)
    private String nomProd;

    @Column(length = 50)
    private String marca;

    @Column(length = 20)
    private String unidad;

    @Column(name = "cant_prod", nullable = false)
    private Integer cantProd;

    @Column(name = "precio_prod", nullable = false, precision = 10, scale = 2)
    private BigDecimal precioProd;

    @Column(name = "img_prod", length = 255)
    private String imgProd;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 15)
    private Estado estado = Estado.Disponible;

    @ManyToOne
    @JsonBackReference
    @JoinColumn(name = "id_subcat", nullable = false)
    private SubCategoria subcategoria; 


    public enum Estado {
        Disponible, Critico, Agotado, Inactivo
    }
}
