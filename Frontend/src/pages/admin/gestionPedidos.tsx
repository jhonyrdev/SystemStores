import React from "react";
import { Button } from "@components/ui/button";
import { DynamicTable } from "@components/common/dataTable";
import TableFiltro from "@components/common/tableFiltro";
import TablePaginas from "@components/common/tablePaginas";
import { Badge } from "@components/ui/badge";
import type { ColumnDef } from "@tanstack/react-table";
import { Download } from "lucide-react";

interface Pedido {
  id: string;
  cliente: string;
  fecha: string;
  estado: "Pendiente" | "Enviado" | "Entregado" | "Cancelado";
  monto: string;
}

const allData: Pedido[] = [
  {
    id: "PED-001",
    cliente: "Juan Pérez",
    fecha: "2025-10-01",
    estado: "Pendiente",
    monto: "$120.00",
  }
];

const columns: ColumnDef<Pedido>[] = [
  { accessorKey: "id", header: "ID Pedido" },
  { accessorKey: "cliente", header: "Cliente" },
  { accessorKey: "fecha", header: "Fecha" },
  {
    accessorKey: "estado",
    header: "Estado",
    cell: ({ row }) => {
      const value = row.getValue("estado") as Pedido["estado"];
      const color =
        value === "Pendiente"
          ? "bg-yellow-100 text-yellow-700"
          : value === "Enviado"
          ? "bg-blue-100 text-blue-700"
          : value === "Entregado"
          ? "bg-green-100 text-green-700"
          : "bg-red-100 text-red-700";
      return <Badge className={color}>{value}</Badge>;
    },
  },
  { accessorKey: "monto", header: "Monto Total" },
  {
    id: "acciones",
    header: "Acciones",
    cell: () => (
      <span className="text-blue-600 hover:underline cursor-pointer">
        Ver detalles
      </span>
    ),
  },
];

const GestionPedidos = () => {
  const [page, setPage] = React.useState(1);
  const [filtered, setFiltered] = React.useState(allData);
  const perPage = 5;
  const totalPages = Math.ceil(filtered.length / perPage);

  const paginatedData = filtered.slice((page - 1) * perPage, page * perPage);

  const handleSearch = (value: string) => {
    const res = allData.filter((p) =>
      p.cliente.toLowerCase().includes(value.toLowerCase())
    );
    setFiltered(res);
    setPage(1);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Encabezado */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Pedidos</h1>

        <Button variant="outline" className="flex items-center gap-2 bg-secundario text-black">
          <Download className="h-4 w-4" />
          <span className="hidden sm:inline">Exportar pedidos</span>
        </Button>
      </div>

      {/* Contenedor principal */}
      <div className="rounded-lg border bg-card p-4 shadow-sm">
        <TableFiltro
          searchPlaceholder="Buscar pedidos..."
          onSearch={handleSearch}
          filterGroups={[
            {
              label: "Estado",
              items: ["Pendiente", "Enviado", "Entregado", "Cancelado"],
            },
          ]}
        />

        <DynamicTable columns={columns} data={paginatedData} />

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

export default GestionPedidos;