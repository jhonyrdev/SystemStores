import React from "react";
import { DynamicTable } from "@components/common/dataTable";
import TableFiltro from "@components/common/tableFiltro";
import TablePaginas from "@components/common/tablePaginas";
import { listarCategorias } from "@/services/productos/categoriaServices";
import { toast } from "sonner";
import type { Categoria } from "@/types/product";
import { categoriaColumns } from "@/constants/tabla/columnsCategoria";

const GestionCategorias = () => {
  const [categorias, setCategorias] = React.useState<Categoria[]>([]);
  const [filtered, setFiltered] = React.useState<Categoria[]>([]);
  const [page, setPage] = React.useState(1);
  const perPage = 5;

  React.useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const data = await listarCategorias();
        setCategorias(data);
        setFiltered(data);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        toast.error("Error al cargar categorías", {
          description: error.message,
        });
      }
    };

    fetchCategorias();
  }, []);

  const handleFilterChange = (selected: string) => {
    let res = categorias;

    if (selected !== "Todos") {
      res = res.filter((c) => c.nombre === selected);
    }

    setFiltered(res);
    setPage(1);
  };

  const handleSearch = (value: string, filtroSeleccionado?: string) => {
    let res = categorias;

    if (value) {
      res = res.filter((c) =>
        c.nombre.toLowerCase().includes(value.toLowerCase())
      );
    }

    if (filtroSeleccionado && filtroSeleccionado !== "Todos") {
      res = res.filter((c) => c.nombre === filtroSeleccionado);
    }

    setFiltered(res);
    setPage(1);
  };

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginatedData = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Categorías</h1>
      </div>

      <div className="rounded-lg border bg-card p-4 shadow-sm">
        <TableFiltro
          searchPlaceholder="Buscar categorías..."
          onSearch={handleSearch}
          filterGroups={[
            {
              label: "Tipo de Categoría",
              items: ["Todos", ...new Set(categorias.map((c) => c.nombre))],
              onSelect: handleFilterChange,
            },
          ]}
        />

        {/* Aquí pasamos las columnas importadas */}
        <DynamicTable columns={categoriaColumns} data={paginatedData} />

        <TablePaginas
          page={page}
          totalPages={totalPages}
          setPage={setPage}
          totalItems={filtered.length}
          perPage={perPage}
        />
      </div>
    </div>
  );
};

export default GestionCategorias;
