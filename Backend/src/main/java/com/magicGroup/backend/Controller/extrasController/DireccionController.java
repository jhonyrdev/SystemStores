package com.magicGroup.backend.Controller.extrasController;

import com.magicGroup.backend.model.extras.Direccion;
import com.magicGroup.backend.model.usuarios.Cliente;
import com.magicGroup.backend.repository.usuariosRepository.ClienteRepository;
import com.magicGroup.backend.services.extrasServices.DireccionService;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;

import java.util.*;

/* @author Jhonn */

@RestController
@RequestMapping("/api/direcciones")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class DireccionController {

    private final DireccionService direccionService;
    private final ClienteRepository clienteRepository;

    public DireccionController(DireccionService direccionService, ClienteRepository clienteRepository) {
        this.direccionService = direccionService;
        this.clienteRepository = clienteRepository;
    }

    @GetMapping("/cliente/{idCli}")
    public ResponseEntity<List<Map<String, Object>>> listarPorCliente(@PathVariable Integer idCli) {
        List<Map<String, Object>> direcciones = direccionService.obtenerDireccionesPorCliente(idCli);
        return ResponseEntity.ok(direcciones);
    }

    @PostMapping
    public ResponseEntity<?> crearDireccion(@RequestBody Map<String, Object> body) {
        try {
            Integer idCli = (Integer) body.get("idCliente");
            String direccionTexto = (String) body.get("direccion");
            String tipoStr = (String) body.get("tipo");

            Optional<Cliente> clienteOpt = clienteRepository.findById(idCli);
            if (clienteOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Cliente no encontrado");
            }

            Direccion dir = new Direccion();
            dir.setDireccion(direccionTexto);
            dir.setTipo(Direccion.Tipo.valueOf(tipoStr.toLowerCase()));
            dir.setCliente(clienteOpt.get());

            Direccion nueva = direccionService.guardar(dir);
            return ResponseEntity.status(HttpStatus.CREATED).body(nueva);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error al crear la dirección: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> editarDireccion(@PathVariable Integer id, @RequestBody Map<String, Object> body) {
        Optional<Direccion> optDir = direccionService.obtenerPorId(id);
        if (optDir.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Dirección no encontrada");
        }

        try {
            Direccion dir = optDir.get();
            dir.setDireccion((String) body.get("direccion"));
            dir.setTipo(Direccion.Tipo.valueOf(((String) body.get("tipo")).toLowerCase()));

            Direccion actualizada = direccionService.guardar(dir);
            return ResponseEntity.ok(actualizada);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error al actualizar: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarDireccion(@PathVariable Integer id) {
        try {
            if (direccionService.estaEnUso(id)) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body("No se puede eliminar la dirección, está en uso.");
            }

            direccionService.eliminarPorId(id);
            return ResponseEntity.ok("Dirección eliminada correctamente.");

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error al eliminar: " + e.getMessage());
        }
    }
}
