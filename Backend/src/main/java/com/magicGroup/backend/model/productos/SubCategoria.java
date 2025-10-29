/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */

package com.magicGroup.backend.model.productos;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;
import com.fasterxml.jackson.annotation.*;


/* @author Jhonn */

@Entity
@Table(name = "Subcategoria")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SubCategoria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_subcat")
    private Integer idSubcat;

    @Column(name = "nom_subcat", nullable = false, length = 45)
    private String nomSubcat;

    @ManyToOne
    @JoinColumn(name = "id_cat", nullable = false)
    private Categoria categoria;

    @OneToMany(mappedBy = "subcategoria", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<Producto> productos;
}
