package com.magicGroup.backend.services.usuariosServices.usuariosServicesImpl;

import com.magicGroup.backend.model.usuarios.Cliente;
import com.magicGroup.backend.repository.usuariosRepository.ClienteRepository;
import com.magicGroup.backend.repository.ventasRepository.PedidoRepository;
import com.magicGroup.backend.services.GenericServiceImpl;
import com.magicGroup.backend.services.usuariosServices.ClienteService;
import org.springframework.stereotype.Service;
import java.time.temporal.ChronoUnit;

import java.time.*;
import java.util.List;

@Service
public class ClienteServiceImpl extends GenericServiceImpl<Cliente, Integer> implements ClienteService {

    private final PedidoRepository pedidoRepository;

    public ClienteServiceImpl(ClienteRepository repository, PedidoRepository pedidoRepository) {
        super(repository);
        this.pedidoRepository = pedidoRepository;
    }

    @Override
    public List<Cliente> listarTodos() {
        List<Cliente> clientes = repository.findAll();
        LocalDate hoy = LocalDate.now();

        for (Cliente cliente : clientes) {
            LocalDate ultimaCompra = pedidoRepository.encontrarUltimaFechaPedido(cliente.getIdCli());
            boolean tienePedidos = pedidoRepository.clienteTienePedidos(cliente.getIdCli());

            if (!tienePedidos) {
                long diasDesdeRegistro = ChronoUnit.DAYS.between(cliente.getFechaReg(), hoy);
                if (diasDesdeRegistro > 30) {
                    cliente.setEstado(Cliente.Estado.inactivo);
                } else {
                    cliente.setEstado(Cliente.Estado.activo);
                }
            } else {
                long mesesSinComprar = ChronoUnit.MONTHS.between(ultimaCompra, hoy);
                if (mesesSinComprar >= 3) {
                    cliente.setEstado(Cliente.Estado.inactivo);
                } else {
                    cliente.setEstado(Cliente.Estado.activo);
                }
            }

            repository.save(cliente);
        }

        return clientes;
    }

    // Reactivar por login
    public void reactivarAlIniciarSesion(Integer clienteId) {
        Cliente cliente = repository.findById(clienteId).orElse(null);
        if (cliente == null) return;

        boolean tienePedidos = pedidoRepository.clienteTienePedidos(clienteId);

        if (!tienePedidos && cliente.getEstado() == Cliente.Estado.inactivo) {
            cliente.setEstado(Cliente.Estado.activo);
            repository.save(cliente);
        }
    }
}
