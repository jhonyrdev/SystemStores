import { useState } from "react";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { DynamicTable } from "@components/common/dataTable";
import TableFiltro from "@components/common/tableFiltro";
import TablePaginas from "@components/common/tablePaginas";
import type { ColumnDef } from "@tanstack/react-table";
import { Download } from "lucide-react";

interface Reclamo {
  id: string;
  cliente: string;
  fecha: string;
  tipo: string;
  asunto: string;
  estado: "Nuevo" | "Revisado" | "Resuelto";
}

const reclamosData: Reclamo[] = [
  {
    id: "R001",
    cliente: "Juan Pérez",
    fecha: "2025-10-01",
    tipo: "Producto",
    asunto: "El producto llegó dañado",
    estado: "Nuevo",
  },
];

const columns: ColumnDef<Reclamo>[] = [
  { accessorKey: "id", header: "ID Reclamo" },
  { accessorKey: "cliente", header: "Cliente" },
  { accessorKey: "fecha", header: "Fecha" },
  { accessorKey: "tipo", header: "Tipo" },
  { accessorKey: "asunto", header: "Asunto" },
  {
    accessorKey: "estado",
    header: "Estado",
    cell: ({ row }) => {
      const value = row.getValue("estado") as Reclamo["estado"];
      const color =
        value === "Nuevo"
          ? "bg-yellow-100 text-yellow-700"
          : value === "Revisado"
          ? "bg-blue-100 text-blue-700"
          : value === "Resuelto"
          ? "bg-green-100 text-green-700"
          : "bg-gray-100 text-gray-700";

      return <Badge className={color}>{value}</Badge>;
    },
  },
  {
    id: "acciones",
    header: "Acción",
    cell: () => <span className="text-primary cursor-pointer">Ver detalle</span>,
  },
];

const GestionReclamos = () => {
  const [page, setPage] = useState(1);
  const [filtered, setFiltered] = useState<Reclamo[]>(reclamosData);
  const [activeTab, setActiveTab] = useState<string>("Todos");

  const perPage = 5;
  const totalPages = Math.ceil(filtered.length / perPage);

  const paginatedData = filtered.slice((page - 1) * perPage, page * perPage);

  const handleSearch = (value: string) => {
    const res = reclamosData.filter(
      (r) =>
        r.cliente.toLowerCase().includes(value.toLowerCase()) ||
        r.id.toLowerCase().includes(value.toLowerCase()) ||
        r.asunto.toLowerCase().includes(value.toLowerCase())
    );
    setFiltered(res);
    setPage(1);
  };

  const handleFilterByEstado = (estado: string) => {
    if (estado === "Todos") {
      setFiltered(reclamosData);
    } else {
      setFiltered(reclamosData.filter((r) => r.estado === estado));
    }
    setActiveTab(estado);
    setPage(1);
  };

  const counters = {
    total: reclamosData.length,
    nuevo: reclamosData.filter((r) => r.estado === "Nuevo").length,
    revisado: reclamosData.filter((r) => r.estado === "Revisado").length,
    resueltos: reclamosData.filter((r) => r.estado === "Resuelto").length,
  };

  return (
    <div className="space-y-6 pb-20">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Reclamos</h1>
        <Button variant="outline" className="flex items-center gap-2 bg-secundario text-black">
          <Download className="h-4 w-4" />
          <span className="hidden sm:inline">Exportar Reclamos</span>
        </Button>
      </div>

      {/* ESTADÍSTICAS / CONTADORES */}
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-3">
        <div className="p-3 rounded-lg border bg-card text-center">
          <p className="text-xs text-muted-foreground">Total</p>
          <p className="text-lg font-semibold">{counters.total}</p>
        </div>
        <div className="p-3 rounded-lg border bg-card text-center">
          <p className="text-xs text-yellow-600">Nuevo</p>
          <p className="text-lg font-semibold">{counters.nuevo}</p>
        </div>
        <div className="p-3 rounded-lg border bg-card text-center">
          <p className="text-xs text-blue-600">Revisado</p>
          <p className="text-lg font-semibold">{counters.revisado}</p>
        </div>
        <div className="p-3 rounded-lg border bg-card text-center">
          <p className="text-xs text-green-600">Resueltos</p>
          <p className="text-lg font-semibold">{counters.resueltos}</p>
        </div>
      </div>

      {/* TABS DE FILTRO RÁPIDO */}
      <div className="flex flex-wrap gap-2">
        {["Todos", "Nuevo", "Revisado", "Resuelto"].map((estado) => (
          <Button
            key={estado}
            variant={activeTab === estado ? "default" : "outline"}
            size="sm"
            onClick={() => handleFilterByEstado(estado)}
          >
            {estado}
          </Button>
        ))}
      </div>

      {/* TABLA */}
      <div className="rounded-lg border bg-card p-4 shadow-sm">
        <TableFiltro
          searchPlaceholder="Buscar reclamos..."
          onSearch={handleSearch}
          filterGroups={[
            { label: "Tipo", items: ["Producto", "Envío", "Pago"] },
            {
              label: "Estado",
              items: ["Nuevo", "Revisado", "Resuelto"],
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

export default GestionReclamos;

