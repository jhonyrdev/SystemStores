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
@Table(name = "Factura")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Factura {

    @Id
    private Integer idVenta;

    @OneToOne
    @MapsId
    @JoinColumn(name = "id_venta")
    private Venta venta;

    @Column(nullable = false, unique = true, length = 20)
    private String codigoFactura;

    @Column(length = 11)
    private String rucCliente;

    @Column(length = 100)
    private String razonSocialCliente;
}
