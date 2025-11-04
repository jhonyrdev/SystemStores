package com.magicGroup.backend.model.usuarios;

import jakarta.persistence.*;           
import lombok.*; 

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

