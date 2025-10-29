import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { listarCategorias } from "@/services/productos/categoriaServices";
import { listarSubcategoriasPorCategoria } from "@/services/productos/SubCategoriaServices";
import type { Categoria, SubCategoria } from "@/types/product";
import {
  CatalogoProvider,
  useCatalogoContext,
} from "@/context/catalogoContext";

interface CatalogoLayoutProps {
  children?: React.ReactNode;
}

const InnerLayout = ({ children }: CatalogoLayoutProps) => {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug?: string }>();
  const categoriaActual =
    !slug || slug.toLowerCase() === "todos" ? "todos" : slug.toLowerCase();

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showSidebar, setShowSidebar] = useState(!isMobile);

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [subcategorias, setSubcategorias] = useState<SubCategoria[]>([]);

  const { subcatsSeleccionadas, toggleSubcategoria, resetSubcategorias } =
    useCatalogoContext();

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setShowSidebar(!mobile);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        const cats = await listarCategorias();
        setCategorias(cats);

        if (categoriaActual !== "todos") {
          const cat = cats.find(
            (c: { nombre: string }) => c.nombre.toLowerCase() === categoriaActual
          );
          if (cat) {
            const subs = await listarSubcategoriasPorCategoria(cat.idCat);
            setSubcategorias(subs);
          } else {
            setSubcategorias([]);
          }
        } else {
          setSubcategorias([]);
        }

        // Limpia el estado al final del cambio de categoría
        resetSubcategorias();
      } catch (err) {
        console.error("Error cargando categorías o subcategorías", err);
      }
    }

    fetchData();
  }, [categoriaActual]);

  const handleBackClick = () => {
    if (isMobile) {
      setShowSidebar(true);
    } else {
      navigate("/");
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      {showSidebar && (
        <aside className="w-full md:w-1/4 border-r bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-lg font-semibold text-[#a51884]">
            Categorías
          </h3>
          <ul>
            <li key="todos">
              <button
                className={`block w-full text-left px-2 py-1 rounded ${
                  categoriaActual === "todos"
                    ? "bg-[#a51884] text-white"
                    : "text-gray-800 hover:bg-gray-100"
                }`}
                onClick={() => {
                  navigate("/categoria");
                  if (isMobile) setShowSidebar(false);
                }}
              >
                Todos
              </button>
            </li>

            {categorias.map((cat) => (
              <li key={cat.idCat}>
                <button
                  className={`block w-full text-left px-2 py-1 rounded ${
                    cat.nombre.toLowerCase() === categoriaActual
                      ? "bg-[#a51884] text-white"
                      : "text-gray-800 hover:bg-gray-100"
                  }`}
                  onClick={() => {
                    navigate(`/categoria/${cat.nombre.toLowerCase()}`);
                    if (isMobile) setShowSidebar(false);
                  }}
                >
                  {cat.nombre}
                </button>
              </li>
            ))}
          </ul>

          {categoriaActual !== "todos" && subcategorias.length > 0 && (
            <>
              <h4 className="mt-6 mb-3 text-md font-semibold text-[#a51884]">
                Subcategorías
              </h4>
              <ul>
                {subcategorias.map((sub) => {
                  const idNum = Number(sub.idSubCat);
                  const isChecked = subcatsSeleccionadas.includes(idNum);

                  return (
                    <li key={sub.idSubCat}>
                      <label className="flex items-center space-x-2 px-2 py-1 cursor-pointer hover:bg-gray-50 rounded">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            e.stopPropagation();
                            toggleSubcategoria(idNum);
                          }}
                          className="w-4 h-4 cursor-pointer"
                        />
                        <span className="select-none">{sub.nombre}</span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </aside>
      )}

      {(!isMobile || !showSidebar) && (
        <main className="flex-1 p-6 overflow-y-auto bg-white">
          <div className="mb-4">
            <button
              onClick={handleBackClick}
              className="text-blue-600 text-sm hover:underline font-medium"
            >
              ← {isMobile ? "Volver al menú" : "Volver al inicio"}
            </button>
          </div>
          {children}
        </main>
      )}
    </div>
  );
};

const CatalogoLayout = ({ children }: CatalogoLayoutProps) => {
  return (
    <CatalogoProvider>
      <InnerLayout>{children}</InnerLayout>
    </CatalogoProvider>
  );
};

export default CatalogoLayout;
