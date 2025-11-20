package com.magicGroup.backend.Controller.ventasController;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import java.util.List;
import com.magicGroup.backend.services.ventasServices.FacturaService;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/facturas")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class FacturaController {

    private final FacturaService facturaService;

    @GetMapping("/properties")
    public ResponseEntity<List<String>> listarPropiedadesFactura() {
        try {
            List<String> props = facturaService.listarPropiedades();
            return ResponseEntity.ok(props);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/venta/{idVenta}")
    public ResponseEntity<?> obtenerInfoFacturaPorVenta(@PathVariable Integer idVenta) {
        try {
            var opt = facturaService.obtenerInfoPorVenta(idVenta);
            if (opt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Factura no encontrada para venta: " + idVenta);
            }
            return ResponseEntity.ok(opt.get());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
