
package com.magicGroup.backend.model.extras;

import com.magicGroup.backend.model.usuarios.Administrador;
import jakarta.persistence.*;           
import lombok.*; 

import java.time.LocalDate;
import java.time.LocalTime;

/**
 *
 * @author Jhonn
 */
@Entity
@Table(name = "Historial")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Historial {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idMov;

    private LocalDate fecha;
    private LocalTime hora;

    @ManyToOne
    @JoinColumn(name = "id_admin", nullable = false)
    private Administrador administrador;
}

