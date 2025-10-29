/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */

package com.magicGroup.backend.model.usuarios;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
/**
 *
 * @author Jhonn
 */

@Entity
@Table(name = "Cliente")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Cliente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idCli;

    @Column(nullable = false, unique = true, length = 20)
    private String codCli;

    @Column(nullable = false, length = 45)
    private String nomCli;

    @Column(nullable = false, length = 45)
    private String apeCli;

    @Column(nullable = false, unique = true, length = 45)
    private String correoCli;

    @Column(length = 20)
    private String telCli;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Estado estado = Estado.activo;

    @Column(nullable = false)
    private LocalDate fechaReg;

    @OneToOne
    @JoinColumn(name = "id_cred")
    private Credencial credencial;

    public enum Estado {
        activo, inactivo
    }
}
