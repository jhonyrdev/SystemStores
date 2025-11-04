package com.magicGroup.backend.Controller.usuariosController;

import com.magicGroup.backend.model.usuarios.Cliente;
import com.magicGroup.backend.services.extrasServices.RegistroService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "http://localhost:5173")
public class registroController {

    private final RegistroService registroService;

    public registroController(RegistroService registroService) {
        this.registroService = registroService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> registrarCliente(@RequestBody Map<String, String> body) {
        String nombre = body.get("nombre");
        String correo = body.get("correo");
        String clave = body.get("clave");

        Cliente nuevo = registroService.registrarCliente(nombre, correo, clave);
        return ResponseEntity.ok(nuevo);
    }
}