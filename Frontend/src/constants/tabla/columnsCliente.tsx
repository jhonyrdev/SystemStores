import type { ColumnDef } from "@tanstack/react-table";
import type { Cliente } from "@/types/cliente";
import { Badge } from "@components/ui/badge";

export const columnsclientes: ColumnDef<Cliente>[] = [
  { accessorKey: "nombre", header: "Nombre" },
  { accessorKey: "correo", header: "Correo" },
  { accessorKey: "telefono", header: "Teléfono" },
  {
    accessorKey: "estado",
    header: "Estado",
    cell: ({ row }) => {
      const value = row.getValue("estado") as Cliente["estado"];
      const color =
        value === "Activo"
          ? "bg-green-100 text-green-700"
          : "bg-red-100 text-red-700";
      return <Badge className={color}>{value}</Badge>;
    },
  },
  { accessorKey: "fechaRegistro", header: "Fecha de Registro" },
  { accessorKey: "gastoTotal", header: "Gasto Total" },
  {
    id: "accion",
    header: "Acción",
    cell: () => (
      <span className="text-blue-600 hover:underline cursor-pointer">
        Ver
      </span>
    ),
  },
];
