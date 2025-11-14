import React, { useEffect } from "react";
import { DynamicTable } from "@components/common/dataTable";
import TableFiltro from "@components/common/tableFiltro";
import TablePaginas from "@components/common/tablePaginas";
import { listarClientes, listarGastosClientes } from "@/services/cliente/clienteService";
import type { Cliente } from "@/types/cliente";
import { columnsclientes } from "@/constants/tabla/columnsCliente";

const GestionClientes = () => {
  const [clientes, setClientes] = React.useState<Cliente[]>([]);
  const [filtered, setFiltered] = React.useState<Cliente[]>([]);
  const [page, setPage] = React.useState(1);
  const perPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      const data = await listarClientes();
      // Traer mapa de gastos
      const gastosMap = await listarGastosClientes();
      const enriquecidos = data.map(c => ({
        ...c,
        gastoTotal: `S/. ${(gastosMap[c.idCliente] ?? 0).toLocaleString(undefined,{minimumFractionDigits:2})}`
      }));
      setClientes(enriquecidos);
      setFiltered(enriquecidos);
    };
    fetchData();
  }, []);


  const totalPages = Math.ceil(filtered.length / perPage);
  const paginatedData = filtered.slice((page - 1) * perPage, page * perPage);

  const handleSearch = (value: string) => {
    const res = clientes.filter((c) =>
      c.nombre.toLowerCase().includes(value.toLowerCase())
    );
    setFiltered(res);
    setPage(1);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Título */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Clientes</h1>
      </div>

      {/* Contenedor principal */}
      <div className="rounded-lg border bg-card p-4 shadow-sm">
        {/* Filtro y búsqueda */}
        <TableFiltro
          searchPlaceholder="Buscar clientes..."
          onSearch={handleSearch}
          filterGroups={[{ label: "Estado", items: ["Activo", "Inactivo"] }]}
        />

        {/* Tabla */}
        <DynamicTable columns={columnsclientes} data={paginatedData} />

        {/* Paginación */}
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

export default GestionClientes;