package com.magicGroup.backend.Controller.productosController;

import com.magicGroup.backend.services.productosServices.CategoriaService;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

import java.util.*;

@RestController
@RequestMapping("/api/categorias")
@CrossOrigin(origins = "http://localhost:5173")
public class CategoriaController {

    private final CategoriaService categoriaService;

    public CategoriaController(CategoriaService categoriaService) {
        this.categoriaService = categoriaService;
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> listarCategorias() {
        var categorias = categoriaService.listarTodos().stream()
            .map(cat -> Map.<String, Object>of(
                    "idCat", cat.getIdCat(),
                    "nombre", cat.getNomCat(),
                    "descripcion", cat.getDesCat()
            ))
            .toList();

        return ResponseEntity.ok(categorias);
    }

    @GetMapping("/buscar")
    public ResponseEntity<?> buscarPorNombre(@RequestParam String nombre) {
        var categoria = categoriaService.buscarPorNombre(nombre);
        if (categoria == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Categoría no encontrada"));
        }
        return ResponseEntity.ok(categoria);
    }
}
