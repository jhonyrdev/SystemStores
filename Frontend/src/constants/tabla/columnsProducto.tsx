import { Badge } from "@components/ui/badge";
import { Edit, Trash } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import type { Producto } from "@/types/product";

export const columnsProducto: ColumnDef<Producto>[] = [
  { accessorKey: "nombre", header: "Producto" },
  { accessorKey: "categoria", header: "Categoría" },
  { accessorKey: "precio", header: "Precio" },
  {
    accessorKey: "stock",
    header: "Stock",
    cell: ({ row }) => {
      const stock = row.getValue("stock") as number;
      const categoria = (row.original as any).categoria?.toLowerCase();

      const umbralCritico = categoria === "comidas" ? 2 : 5;

      const color =
        stock === 0
          ? "text-yellow-700 font-medium"
          : stock <= umbralCritico
          ? "text-red-700 font-semibold"
          : "text-green-700";

      return <span className={color}>{stock}</span>;
    },
  },
  {
    accessorKey: "estado",
  header: "Estado",
  cell: ({ row }) => {
    const estado = row.getValue("estado") as string;
    
    const color = 
      estado === "Inactivo"
        ? "bg-yellow-100 text-yellow-700"
        : estado === "Critico"
        ? "bg-red-100 text-red-700"
        : estado === "Disponible"
        ? "bg-green-100 text-green-700"
        : "bg-gray-100 text-gray-700";
    
    return <Badge className={color}>{estado}</Badge>;
    },
  },
  {
    id: "acciones",
    header: "Acciones",
    cell: ({ row }) => (
      <div className="flex gap-2">
        <button
          onClick={() => alert(`Editar ${row.getValue("nombre")}`)}
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
  },
];
