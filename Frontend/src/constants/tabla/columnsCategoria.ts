import type { Categoria } from "@/types/product";
import  type { ColumnDef } from "@tanstack/react-table";

export const categoriaColumns: ColumnDef<Categoria>[] = [
  { accessorKey: "nombre", header: "Nombre de Categoría" },
  { accessorKey: "descripcion", header: "Descripción" },
]