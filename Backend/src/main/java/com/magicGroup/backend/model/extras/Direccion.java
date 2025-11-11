
package com.magicGroup.backend.model.extras;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.magicGroup.backend.model.usuarios.Cliente;
import jakarta.persistence.*;           
import lombok.*; 

@Entity
@Table(name = "Direccion")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Direccion {
    
	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_dir")
    private Integer id;

    @Column(name = "direccion", nullable = false, columnDefinition = "TEXT")
    private String direccion;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private Tipo tipo = Tipo.casa;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_cli", nullable = false)
    @JsonIgnoreProperties({"credencial", "hibernateLazyInitializer", "handler"})
    private Cliente cliente;

	public enum Tipo {
		casa, oficina, otro
	}
}
