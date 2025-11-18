package com.magicGroup.backend.services.ventasServices;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.magicGroup.backend.model.ventas.Factura;
import com.magicGroup.backend.repository.ventasRepository.FacturaRepository;
import com.magicGroup.backend.repository.ventasRepository.VentaRepository;
import java.lang.reflect.Field;
import java.util.*;

@Service
@RequiredArgsConstructor
public class FacturaService {

    private final FacturaRepository facturaRepository;
    private final VentaRepository ventaRepository;

    public List<String> listarPropiedades() {
        Field[] fields = Factura.class.getDeclaredFields();
        List<String> props = new ArrayList<>();
        for (Field f : fields) {
            props.add(f.getName());
        }
        return props;
    }

    public Optional<Map<String, Object>> obtenerInfoPorVenta(Integer idVenta) {
        Optional<Factura> fOpt = facturaRepository.findById(idVenta);
        if (fOpt.isEmpty()) {
            return Optional.empty();
        }
        Factura f = fOpt.get();
        Map<String, Object> out = new HashMap<>();
        out.put("idVenta", idVenta);
        out.put("codigoFactura", f.getCodigoFactura());
        out.put("rucCliente", f.getRucCliente());
        out.put("razonSocialCliente", f.getRazonSocialCliente());

        // Include some venta basic info if present
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
