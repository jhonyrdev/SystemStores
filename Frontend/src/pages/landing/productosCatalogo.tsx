import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import ProductoCard from "@/components/common/ProductoCard";
import ProductBox from "@/components/client/productBox";
import { listarProductos } from "@/services/productos/productoServices";
import type { Producto } from "@/types/product";
import { useCatalogoContext } from "@/context/catalogoContext";
import TablePaginas from "@/components/common/tablePaginas"; // tu paginador

export default function ProductoCatalogo() {
  const { slug } = useParams<{ slug?: string }>();
  const categoriaActual =
    !slug || slug.toLowerCase() === "todos" ? "todos" : slug.toLowerCase();

  const { subcatsSeleccionadas } = useCatalogoContext();

  const [productos, setProductos] = useState<Producto[]>([]);
  const [busqueda, setBusqueda] = useState<string>("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [productoSeleccionado, setProductoSeleccionado] =
    useState<Producto | null>(null);
  const [mostrarModal, setMostrarModal] = useState(false);

  // 📌 2 filas × 3 columnas = 6 productos por página
  const [page, setPage] = useState(1);
  const perPage = 6;

  const abrirModal = useCallback((producto: Producto) => {
    setProductoSeleccionado(producto);
    setMostrarModal(true);
  }, []);

  const cerrarModal = useCallback(() => {
    setMostrarModal(false);
    setProductoSeleccionado(null);
  }, []);

  // Cargar todos los productos
  useEffect(() => {
    async function fetchData() {
      try {
        setCargando(true);
        const prods = await listarProductos();
        setProductos(prods);
        setError(null);
      } catch (err) {
        setError("Error al cargar productos");
      } finally {
        setCargando(false);
      }
    }
    fetchData();
  }, []);

  // Aplicar filtros
  const filtrados = useMemo(() => {
    let resultado = productos;

    if (categoriaActual !== "todos") {
      resultado = resultado.filter(
        (p) => p.categoria.toLowerCase() === categoriaActual
      );
    }

    if (subcatsSeleccionadas.length > 0) {
      resultado = resultado.filter((p) =>
        subcatsSeleccionadas.includes(Number(p.idSubCat))
      );
    }

    if (busqueda.trim() !== "") {
      resultado = resultado.filter((p) =>
        p.nombre.toLowerCase().includes(busqueda.toLowerCase())
      );
    }

    setPage(1); // Reset paginación al cambiar filtro
    return resultado;
  }, [productos, categoriaActual, subcatsSeleccionadas, busqueda]);

  // Paginación
  const totalItems = filtrados.length;
  const totalPages = Math.ceil(totalItems / perPage);
  const productosPaginados = filtrados.slice(
    (page - 1) * perPage,
    page * perPage
  );

  if (cargando) return <div className="text-center py-10">Cargando...</div>;
  if (error)
    return <div className="text-center text-red-500 py-10">{error}</div>;

  return (
    <>
      <h2 className="text-2xl font-bold mb-4 text-[#a51884] capitalize">
        {categoriaActual === "todos"
          ? "Catálogo Completo"
          : `Categoría: ${categoriaActual}`}
      </h2>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Buscar productos..."
          className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#a51884]"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {productosPaginados.length === 0 ? (
        <p className="text-gray-500">
          No se encontraron productos con los filtros seleccionados.
        </p>
      ) : (
        <div
          className="
            grid 
            grid-cols-1 
            sm:grid-cols-2 
            lg:grid-cols-3 
            gap-6 
            min-h-[500px]
          "
        >
          {productosPaginados.map((producto) => (
            <ProductoCard
              key={producto.idProd}
              producto={producto}
              onClick={() => abrirModal(producto)}
            />
          ))}
        </div>
      )}

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="mt-6">
          <TablePaginas
            page={page}
            totalPages={totalPages}
            setPage={setPage}
            totalItems={totalItems}
            perPage={perPage}
          />
        </div>
      )}

      <ProductBox
        show={mostrarModal}
        onClose={cerrarModal}
        producto={productoSeleccionado}
      />
    </>
  );
}
