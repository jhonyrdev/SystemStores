/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */

package com.magicGroup.backend.model.extras;

import jakarta.persistence.*;           
import lombok.*; 

/**
 *
 * @author Jhonn
 */
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

