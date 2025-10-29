/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */

package com.magicGroup.backend.model.usuarios;

import jakarta.persistence.*;           
import lombok.*; 

/**
 *
 * @author Jhonn
 */
@Entity
@Table(name = "Administrador")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Administrador {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idAdmin;

    @Column(nullable = false, length = 45)
    private String nomAdmin;

    @Column(nullable = false, unique = true, length = 45)
    private String correoAdmin;

    @OneToOne
    @JoinColumn(name = "id_cred", nullable = false)
    private Credencial credencial;
}

