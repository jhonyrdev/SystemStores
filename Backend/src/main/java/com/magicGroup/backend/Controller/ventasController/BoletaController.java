package com.magicGroup.backend.Controller.ventasController;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import java.util.List;
import com.magicGroup.backend.services.ventasServices.BoletaService;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/boletas")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class BoletaController {

    private final BoletaService boletaService;

    @GetMapping("/properties")
    public ResponseEntity<List<String>> listarPropiedadesBoleta() {
        try {
            List<String> props = boletaService.listarPropiedades();
            return ResponseEntity.ok(props);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/venta/{idVenta}")
    public ResponseEntity<?> obtenerInfoBoletaPorVenta(@PathVariable Integer idVenta) {
        try {
            var opt = boletaService.obtenerInfoPorVenta(idVenta);
            if (opt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Boleta no encontrada para venta: " + idVenta);
            }
            return ResponseEntity.ok(opt.get());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
