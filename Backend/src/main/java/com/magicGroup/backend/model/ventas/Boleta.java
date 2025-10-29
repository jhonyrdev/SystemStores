/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */

package com.magicGroup.backend.model.ventas;

import jakarta.persistence.*;
import lombok.*;

/**
 *
 * @author Jhonn
 */
@Entity
@Table(name = "Boleta")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Boleta {

    @Id
    private Integer idVenta;

    @OneToOne
    @MapsId
    @JoinColumn(name = "id_venta")
    private Venta venta;

    @Column(nullable = false, unique = true, length = 20)
    private String codigoBoleta;
}

