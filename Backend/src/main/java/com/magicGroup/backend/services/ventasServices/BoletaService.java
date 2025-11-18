package com.magicGroup.backend.services.ventasServices;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.magicGroup.backend.model.ventas.Boleta;
import com.magicGroup.backend.repository.ventasRepository.BoletaRepository;
import com.magicGroup.backend.repository.ventasRepository.VentaRepository;
import java.lang.reflect.Field;
import java.util.*;

@Service
@RequiredArgsConstructor
public class BoletaService {

    private final BoletaRepository boletaRepository;
    private final VentaRepository ventaRepository;

    public List<String> listarPropiedades() {
        Field[] fields = Boleta.class.getDeclaredFields();
        List<String> props = new ArrayList<>();
        for (Field f : fields) {
            props.add(f.getName());
        }
        return props;
    }

    public Optional<Map<String, Object>> obtenerInfoPorVenta(Integer idVenta) {
        Optional<Boleta> bOpt = boletaRepository.findById(idVenta);
        if (bOpt.isEmpty()) {
            return Optional.empty();
        }
        Boleta b = bOpt.get();
        Map<String, Object> out = new HashMap<>();
        out.put("idVenta", idVenta);
        out.put("codigoBoleta", b.getCodigoBoleta());

        ventaRepository.findById(idVenta).ifPresent(v -> {
            out.put("tipo", v.getTipo() != null ? v.getTipo().name() : null);
            if (v.getCliente() != null) {
                out.put("clienteCod", v.getCliente().getCodCli());
                out.put("clienteNombre", (v.getCliente().getNomCli() == null ? "" : v.getCliente().getNomCli()) + " "
                        + (v.getCliente().getApeCli() == null ? "" : v.getCliente().getApeCli()));
            }
        });

        return Optional.of(out);
    }
}
