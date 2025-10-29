import { memo, Suspense, useCallback, useEffect, useState } from "react";
import ProductBox from "../client/productBox";
import type { Producto } from "@/types/product";
import { listarProductos } from "@/services/productos/productoServices";
import ProductoCard from "../common/ProductoCard";
import { useNavigate } from "react-router-dom";

const ProductoSection = memo(() => {
  const navigate = useNavigate();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [productoSeleccionado, setProductoSeleccionado] =
    useState<Producto | null>(null);
  const [mostrarModal, setMostrarModal] = useState(false);

  const abrirModal = useCallback((producto: Producto) => {
    setProductoSeleccionado(producto);
    setMostrarModal(true);
  }, []);

  const cerrarModal = useCallback(() => {
    setMostrarModal(false);
    setProductoSeleccionado(null);
  }, []);

  // Función para obtener productos aleatorios
  const obtenerProductosAleatorios = useCallback((productos: Producto[], cantidad: number) => {
    const shuffled = [...productos].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, cantidad);
  }, []);

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const data = await listarProductos();
        // Seleccionar 5 productos aleatorios
        const productosAleatorios = obtenerProductosAleatorios(data, 5);
        setProductos(productosAleatorios);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        setError(err.message || "Error al cargar productos");
      } finally {
        setCargando(false);
      }
    };

    fetchProductos();
  }, [obtenerProductosAleatorios]);

  if (cargando) {
    return <div className="text-center py-10">Cargando productos...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 py-10">{error}</div>;
  }

  return (
    <>
      <section className="py-6">
        <h5 className="text-center text-lg font-semibold text-[#a51884] mb-4">
          PRODUCTOS DESTACADOS
        </h5>
        <div className="container-bootstrap my-6 px-4">
          <div className="overflow-x-auto items-center scrollbar-hide">
            <div className="flex items-center gap-4 sm:gap-6 xs:gap-8 w-max mx-auto">
              {productos.map((producto) => (
                <ProductoCard
                  key={producto.idProd}
                  producto={producto}
                  onClick={() => abrirModal(producto)}
                  enOferta
                />
              ))}
            </div>
          </div>

          <div className="text-center mt-4">
            <button className="border-2 border-[#a51884] text-[#a51884] px-4 py-2 rounded-md transition hover:bg-[#a51884] hover:text-yellow-300" onClick={() => navigate("/categoria")}>
              <span className="hidden sm:inline">Ver todos los Productos</span>
              <span className="inline sm:hidden">Ver más</span>
            </button>
          </div>
        </div>
      </section>
      <Suspense fallback={<div>Cargando...</div>}>
        <ProductBox
          show={mostrarModal}
          onClose={cerrarModal}
          producto={productoSeleccionado}
          enOferta={true}
        />
      </Suspense>
    </>
  );
});

export default ProductoSection;