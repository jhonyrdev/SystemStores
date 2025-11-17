package com.magicGroup.backend.services.productosServices.productosServicesImpl;

import com.magicGroup.backend.model.productos.Producto;
import com.magicGroup.backend.repository.productosRepository.ProductoRepository;
import com.magicGroup.backend.services.GenericServiceImpl;
import com.magicGroup.backend.services.productosServices.ProductoService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.text.DecimalFormat;
import java.util.List;

@Service
public class ProductoServiceImpl extends GenericServiceImpl<Producto, Integer>
        implements ProductoService {

    private final ProductoRepository repo;

    public ProductoServiceImpl(ProductoRepository repo) {
        super(repo);
        this.repo = repo;
    }

    @Override
    public String generarCodigo(String nombreCategoria) {
        if (nombreCategoria == null || nombreCategoria.length() < 2)
            throw new IllegalArgumentException("Categoría inválida");

        String prefijo = "COD" + nombreCategoria.substring(0, 2).toUpperCase();
        String ultimo = obtenerUltimoCodigoPorCategoria(prefijo);

        int nuevoNum = (ultimo == null)
                ? 1
                : Integer.parseInt(ultimo.substring(prefijo.length())) + 1;

        return prefijo + new DecimalFormat("00000").format(nuevoNum);
    }

    @Override
    public int contarPorCategoria(String nombreCategoria) {
        return repo.countBySubcategoria_Categoria_NomCat(nombreCategoria);
    }

    @Override
    public String obtenerUltimoCodigoPorCategoria(String prefijo) {
        return repo.findByCodProdStartingWithOrderByCodProdDesc(prefijo)
                .stream()
                .findFirst()
                .map(Producto::getCodProd)
                .orElse(null);
    }

    // Calcula y asigna el estado del producto según su categoría y stock
    private void calcularYAsignarEstado(Producto producto) {
        String categoria = producto.getSubcategoria().getCategoria().getNomCat();
        int stock = producto.getCantProd();
        if (stock == 0) {
            producto.setEstado(Producto.Estado.Inactivo);
            return;
        }
        int stockMinimo = categoria.equalsIgnoreCase("comidas") ? 2 : 5;
        if (stock <= stockMinimo) {
            producto.setEstado(Producto.Estado.Critico);
        } else {
            producto.setEstado(Producto.Estado.Disponible);
        }
    }

    @Override
    public Producto guardar(Producto p) {
        if (p.getIdProd() == null) {
            String nomCat = p.getSubcategoria().getCategoria().getNomCat();
            p.setCodProd(generarCodigo(nomCat));
        }
        calcularYAsignarEstado(p);
        return repo.save(p);
    }

    @Override
    public List<Producto> listarTodosConRelaciones() {
        return repo.findAllWithRelations();
    }

    @Override
    @Transactional
    public void increaseStock(Integer idProd, int cantidad) {
        // usar update atomico en repository
        int updated = repo.adjustStock(idProd, cantidad);
        if (updated == 0) {
            // fallback: si no actualizo (producto no existe) lanzar error
            throw new RuntimeException("Producto no encontrado para aumentar stock: " + idProd);
        }
    }
}
