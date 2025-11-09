package com.magicGroup.backend.Controller.productosController;

import com.magicGroup.backend.model.productos.*;
import com.magicGroup.backend.services.productosServices.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.*;

import java.io.IOException;
import java.nio.file.*;
import java.math.BigDecimal;
import java.util.*;

@RestController
@RequestMapping("/api/productos")
@CrossOrigin(origins = "http://localhost:5173")
public class ProductoController {

    private final ProductoService productoService;
    private final CategoriaService categoriaService;
    private final SubCategoriaService subCategoriaService;

    private static final String PROJECT_ROOT = System.getProperty("user.dir");
    private static final String UPLOAD_DIR = PROJECT_ROOT + "/uploads/productos/";

    public ProductoController(
            ProductoService productoService,
            CategoriaService categoriaService,
            SubCategoriaService subCategoriaService
    ) {
        this.productoService = productoService;
        this.categoriaService = categoriaService;
        this.subCategoriaService = subCategoriaService;
    }
    
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> listarProductos() {
        var productos = productoService.listarTodosConRelaciones().stream().map(p -> {
            Map<String, Object> map = new HashMap<>();
            map.put("idProd", p.getIdProd());
            map.put("nombre", p.getNomProd());
            map.put("categoria", p.getSubcategoria().getCategoria().getNomCat());
            map.put("subcategoria", p.getSubcategoria().getNomSubcat());
            map.put("idSubCat", p.getSubcategoria().getIdSubcat());
            map.put("precio", "S/. " + String.format("%.2f", p.getPrecioProd()));
            map.put("stock", p.getCantProd());
            map.put("estado", p.getEstado().name());
            map.put("imgProd", p.getImgProd());
            map.put("marca", p.getMarca());
            map.put("unidad", p.getUnidad());
            return map;
        }).toList();

        return ResponseEntity.ok(productos);
    }
    
    private String guardarImagen(MultipartFile imagen) throws IOException {
        if (imagen == null || imagen.isEmpty()) return null;

        Path uploadPath = Paths.get(UPLOAD_DIR);
        if (!Files.exists(uploadPath)) Files.createDirectories(uploadPath);

        String nombreImagen = System.currentTimeMillis() + "_" + imagen.getOriginalFilename();
        Files.copy(imagen.getInputStream(), uploadPath.resolve(nombreImagen), StandardCopyOption.REPLACE_EXISTING);
        return nombreImagen;
    }

    // ------------------- REGISTRAR -------------------
    @PostMapping(consumes = {"multipart/form-data"})
public ResponseEntity<?> registrarProducto(
    @RequestParam String nomProd,
    @RequestParam String categoria,
    @RequestParam String subcategoria,
    @RequestParam BigDecimal precioProd,
    @RequestParam Integer cantProd,
    @RequestParam(required = false) String marca,
    @RequestParam(required = false) String unidad,
    @RequestPart(required = false) MultipartFile imagen
) {
    try {
        var cat = categoriaService.buscarPorNombre(categoria);
        if (cat == null)
            return ResponseEntity.badRequest().body(Map.of("error", "Categoría no encontrada"));

        var subCat = subCategoriaService.listarTodos().stream()
            .filter(s -> s.getNomSubcat().equalsIgnoreCase(subcategoria)
                && s.getCategoria().getIdCat().equals(cat.getIdCat()))
            .findFirst()
            .orElse(null);

        if (subCat == null)
            return ResponseEntity.badRequest().body(Map.of("error", "Subcategoría no válida para la categoría"));

        if (cantProd < 0) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", "El stock no puede ser negativo"));
        }

        var producto = new Producto();
        producto.setNomProd(nomProd);
        producto.setSubcategoria(subCat);
        producto.setPrecioProd(precioProd);
        producto.setCantProd(cantProd);
        producto.setMarca(marca);
        producto.setUnidad(unidad);
        producto.setImgProd(guardarImagen(imagen));
        
        var guardado = productoService.guardar(producto);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
            "message", "Producto registrado correctamente",
            "producto", guardado
        ));

    } catch (Exception e) {
        e.printStackTrace();
        return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
    }
}

    // ------------------- ACTUALIZAR -------------------
    @PutMapping(value = "/{id}", consumes = {"multipart/form-data"})
    public ResponseEntity<?> actualizarProducto(
        @PathVariable Integer id,
        @RequestParam String nomProd,
        @RequestParam String categoria,
        @RequestParam String subcategoria,
        @RequestParam BigDecimal precioProd,
        @RequestParam Integer cantProd,
        @RequestParam(required = false) String marca,
        @RequestParam(required = false) String unidad,
        @RequestPart(required = false) MultipartFile imagen
    ) {
        try {
            var producto = productoService.obtenerPorId(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

            var cat = categoriaService.buscarPorNombre(categoria);
            if (cat == null)
                return ResponseEntity.badRequest().body(Map.of("error", "Categoría no encontrada"));

            var subCat = subCategoriaService.listarTodos().stream()
                .filter(s -> s.getNomSubcat().equalsIgnoreCase(subcategoria)
                    && s.getCategoria().getIdCat().equals(cat.getIdCat()))
                .findFirst()
                .orElse(null);

            if (subCat == null)
                return ResponseEntity.badRequest().body(Map.of("error", "Subcategoría no válida para la categoría"));

            if (cantProd < 0) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "El stock no puede ser negativo"));
            }

            producto.setNomProd(nomProd);
            producto.setSubcategoria(subCat);
            producto.setPrecioProd(precioProd);
            producto.setCantProd(cantProd);
            producto.setMarca(marca);
            producto.setUnidad(unidad);

            var nuevaImg = guardarImagen(imagen);
            if (nuevaImg != null) producto.setImgProd(nuevaImg);

            var actualizado = productoService.guardar(producto);

            return ResponseEntity.ok(Map.of(
                "message", "Producto actualizado correctamente",
                "producto", actualizado
            ));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }


    // ------------------- ELIMINAR -------------------
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarProducto(@PathVariable Integer id) {
        try {
            productoService.eliminarPorId(id);
            return ResponseEntity.ok(Map.of("message", "Producto eliminado correctamente"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "No se pudo eliminar el producto: " + e.getMessage()));
        }
    }
}
