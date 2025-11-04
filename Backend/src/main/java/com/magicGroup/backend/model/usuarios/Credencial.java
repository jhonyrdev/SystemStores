package com.magicGroup.backend.model.usuarios;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "Credencial")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Credencial {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idCred;

    @Column(nullable = false, unique = true, length = 45)
    private String usuario;

	@JsonIgnore
    @Column(nullable = false, length = 100)
    private String clave;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Rol rol = Rol.cliente;

    public enum Rol {
        admin, cliente
    }
}

