import React, { useEffect, useState } from "react";
import { Button } from "@components/ui/button";
import { DynamicTable } from "@components/common/dataTable";
import TableFiltro from "@components/common/tableFiltro";
import TablePaginas from "@components/common/tablePaginas";
import { Badge } from "@components/ui/badge";
import type { ColumnDef } from "@tanstack/react-table";
import { Download } from "lucide-react";
import { obtenerTodosPedidos } from "@/services/ventas/pedidoService";

interface Pedido {
  idPed: number;
  cliente: {
    nomCli: string;
  };
  fecha: string;
  estado: "Nuevo" | "Realizado" | "Rechazado";
  total: number;
}

const GestionPedidos = () => {
  const [page, setPage] = React.useState(1);
  const [allData, setAllData] = useState<Pedido[]>([]);
  const [filtered, setFiltered] = React.useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const perPage = 5;
  const totalPages = Math.ceil(filtered.length / perPage);

  const paginatedData = filtered.slice((page - 1) * perPage, page * perPage);

  // Cargar pedidos al montar el componente
  useEffect(() => {
    const cargarPedidos = async () => {
      try {
        setLoading(true);
        const pedidos = await obtenerTodosPedidos();
        setAllData(pedidos);
        setFiltered(pedidos);
        setError(null);
      } catch (err) {
        console.error("Error al cargar pedidos:", err);
        setError("Error al cargar los pedidos");
        setAllData([]);
        setFiltered([]);
      } finally {
        setLoading(false);
      }
    };

    cargarPedidos();
  }, []);

  const handleSearch = (value: string) => {
    const res = allData.filter((p) =>
      p.cliente.nomCli.toLowerCase().includes(value.toLowerCase())
    );
    setFiltered(res);
    setPage(1);
  };

  const columns: ColumnDef<Pedido>[] = [
    {
      accessorKey: "idPed",
      header: "ID Pedido",
      cell: ({ row }) => `#${row.getValue("idPed")}`,
    },
    {
      accessorKey: "cliente.nomCli",
      header: "Cliente",
      cell: ({ row }) => row.original.cliente.nomCli,
    },
    {
      accessorKey: "fecha",
      header: "Fecha",
      cell: ({ row }) => {
        const fecha = row.getValue("fecha") as string;
        return new Date(fecha).toLocaleDateString('es-ES');
      },
    },
    {
      accessorKey: "estado",
      header: "Estado",
      cell: ({ row }) => {
        const value = row.getValue("estado") as Pedido["estado"];
        const color =
          value === "Nuevo"
            ? "bg-yellow-100 text-yellow-700"
            : value === "Realizado"
            ? "bg-green-100 text-green-700"
            : "bg-red-100 text-red-700";
        return <Badge className={color}>{value}</Badge>;
      },
    },
    {
      accessorKey: "total",
      header: "Monto Total",
      cell: ({ row }) => {
        const total = row.getValue("total") as number;
        return `$${total.toFixed(2)}`;
      },
    },
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

  if (loading) {
    return (
      <div className="space-y-6 pb-20">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Pedidos</h1>
        </div>
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <p className="text-center text-gray-500">Cargando pedidos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 pb-20">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Pedidos</h1>
        </div>
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <p className="text-center text-red-500">{error}</p>
        </div>
      </div>
    );
  }

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
          searchPlaceholder="Buscar pedidos por cliente..."
          onSearch={handleSearch}
          filterGroups={[
            {
              label: "Estado",
              items: ["Nuevo", "Realizado", "Rechazado"],
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