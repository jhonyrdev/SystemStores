
package com.magicGroup.backend.model.productos;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "Categoria")
@Data
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {"subcategorias"})
public class Categoria {

   @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_cat")
    private Integer idCat;

    @Column(name = "nom_cat", nullable = false, unique = true, length = 45)
    private String nomCat;

    @Column(name = "des_cat", length = 100)
    private String desCat;

    @OneToMany(mappedBy = "categoria", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SubCategoria> subcategorias;
}
