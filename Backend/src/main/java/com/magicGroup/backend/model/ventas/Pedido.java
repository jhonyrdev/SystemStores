package com.magicGroup.backend.model.ventas;

import com.magicGroup.backend.model.usuarios.Cliente;
import com.magicGroup.backend.model.extras.Direccion;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.*;
import java.util.*;

@Entity
@Table(name = "Pedido")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Pedido {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer idPed;

	@ManyToOne
	@JoinColumn(name = "id_cli", nullable = false)
	private Cliente cliente;

	@ManyToOne
	@JoinColumn(name = "id_dir", nullable = true)
	private Direccion direccion;

	private LocalDate fecha;
	private LocalTime hora;

	@Enumerated(EnumType.STRING)
	@Column(name = "tipo_entrega", nullable = false)
	private TipoEntrega tipoEntrega;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private Estado estado = Estado.Nuevo;

	@Column(nullable = false)
	private BigDecimal total;

	@OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<DetallePedido> detallePedidos = new ArrayList<>();

	public enum TipoEntrega {
		envio, recojo
	}

	public enum Estado {
		Nuevo, Realizado, Rechazado
	}
}
