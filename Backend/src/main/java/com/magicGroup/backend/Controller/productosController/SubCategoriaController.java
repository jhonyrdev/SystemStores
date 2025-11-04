package com.magicGroup.backend.Controller.productosController;

import com.magicGroup.backend.services.productosServices.SubCategoriaService;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import java.util.*;

@RestController
@RequestMapping("/api/subcategorias")
@CrossOrigin(origins = "http://localhost:5173")
public class SubCategoriaController {

    private final SubCategoriaService subCategoriaService;

    public SubCategoriaController(SubCategoriaService subCategoriaService) {
        this.subCategoriaService = subCategoriaService;
    }

    @GetMapping("/por-categoria/{idCat}")
    public ResponseEntity<List<Map<String, Object>>> listarPorCategoria(@PathVariable Integer idCat) {
        var subcategorias = subCategoriaService.listarPorCategoria(idCat)
            .stream()
            .map(sub -> Map.<String, Object>of(
                    "idSubCat", sub.getIdSubcat(),
                    "nombre", sub.getNomSubcat()
            ))
            .toList();
        return ResponseEntity.ok(subcategorias);
    }

}
