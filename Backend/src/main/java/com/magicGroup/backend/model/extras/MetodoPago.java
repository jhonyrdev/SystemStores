package com.magicGroup.backend.model.extras;

import jakarta.persistence.*;           
import lombok.*; 

@Entity
@Table(name = "Metodo_Pago")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MetodoPago {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idMetodo;

    @Column(nullable = false, unique = true, length = 50)
    private String nombreMetodo;
}

