import { useState, useEffect } from "react";
import { Button } from "@components/ui/button";
import { DynamicTable } from "@components/common/dataTable";
import TableFiltro from "@components/common/tableFiltro";
import TablePaginas from "@components/common/tablePaginas";
import { Plus, Edit, Trash } from "lucide-react";
import { toast } from "sonner";
import { listarProductos } from "@/services/productos/productoServices";
import { listarCategorias } from "@/services/productos/categoriaServices";
import { columnsProducto } from "@/constants/tabla/columnsProducto";
import type { Producto } from "@/types/product";
import FormProducto from "@/components/admin/formProducto";

const GestionProductos = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [filtered, setFiltered] = useState<Producto[]>([]);
  const [categoriasFiltro, setCategoriasFiltro] = useState<string[]>(["Todos"]);
  const [page, setPage] = useState(1);
  const perPage = 10;
 
  const [modalOpen, setModalOpen] = useState(false);
  const [productoEditar, setProductoEditar] = useState<Producto | undefined>(undefined);

  const fetchCategorias = async () => {
    try {
      const data = await listarCategorias();
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const nombresCategorias = data.map((c: any) => c.nombre);
      
      const categoriasConTodos = ["Todos", ...nombresCategorias];
      
      setCategoriasFiltro(categoriasConTodos);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error("Error al cargar categorías", { description: err.message });
    }
  };

  // Cargar productos desde backend
  const fetchProductos = async () => {
    try {
      const data = await listarProductos();
      setProductos(data);
      setFiltered(data);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error("Error al cargar productos", { description: err.message });
    }
  };

  useEffect(() => {
    fetchCategorias();
    fetchProductos();
  }, []);

  const handleSearch = (value: string) => {
    const res = productos.filter((p) =>
      p.nombre.toLowerCase().includes(value.toLowerCase())
    );
    setFiltered(res);
    setPage(1);
  };

  const handleFilter = (type: string, value: string) => {
    let res = [...productos];
    if (type === "Categoría" && value !== "Todos") res = res.filter((p) => p.categoria === value);
    if (type === "Disponibilidad" && value !== "Todos") res = res.filter((p) => p.estado === value);
    if (type === "Precio") {
      if (value === "Menor a mayor") res.sort((a, b) => parseFloat(a.precio.slice(1)) - parseFloat(b.precio.slice(1)));
      else if (value === "Mayor a menor") res.sort((a, b) => parseFloat(b.precio.slice(1)) - parseFloat(a.precio.slice(1)));
    }
    setFiltered(res);
    setPage(1);
  };

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginatedData = filtered.slice((page - 1) * perPage, page * perPage);

  const handleNuevoProducto = () => {
    setProductoEditar(undefined);
    setModalOpen(true);
  };

  const handleEditarProducto = (producto: Producto) => {
    setProductoEditar(producto);
    setModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Productos</h1>
        <Button onClick={handleNuevoProducto} className="bg-secundario text-black">
          <Plus className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Añadir producto</span>
        </Button>
      </div>

      {/* Filtros y tabla */}
      <div className="rounded-lg border bg-card p-4 shadow-sm">
        <TableFiltro
          searchPlaceholder="Buscar productos..."
          onSearch={handleSearch}
          filterGroups={[
            { 
              label: "Categoría", 
              items: categoriasFiltro, 
              onSelect: (val) => {
                handleFilter("Categoría", val);
              }
            },
            { label: "Precio", items: ["Ninguno", "Menor a mayor", "Mayor a menor"], onSelect: (val) => handleFilter("Precio", val) },
            { label: "Disponibilidad", items: ["Todos", "Disponible", "Critico", "Inactivo"], onSelect: (val) => handleFilter("Disponibilidad", val) },
          ]}
        />

        {filtered.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            No se cuenta con Productos registrados
          </div>
        ) : (
          <DynamicTable
            columns={columnsProducto.map((col) =>
              col.id === "acciones"
                ? {
                    ...col,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    cell: ({ row }: import("@tanstack/react-table").CellContext<Producto, any>) => (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditarProducto(row.original)}
                          className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => alert(`Eliminar ${row.getValue("nombre")}`)}
                          className="p-1 text-red-600 hover:bg-red-100 rounded"
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      </div>
                    ),
                  }
                : col
            )}
            data={paginatedData}
          />
        )}

        <TablePaginas
          page={page}
          totalPages={totalPages}
          setPage={setPage}
          totalItems={filtered.length}
          perPage={perPage}
        />
      </div>

      {/* Modal registro / edición */}
      <FormProducto
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        productToEdit={productoEditar}
        onSuccess={fetchProductos} 
      />
    </div>
  );
};

export default GestionProductos;