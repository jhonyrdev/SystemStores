"use client";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";

// Usa la interfaz según lo que venga del backend
interface Categoria {
  id: number;
  nombre: string;
}

interface DropdownCategProps {
  categorias: Categoria[];
}

export default function DropdownCateg({ categorias }: DropdownCategProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          Categorías <ChevronDown className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Selecciona una categoría</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {categorias.map((categoria) => (
          <DropdownMenuItem key={categoria.id} asChild>
            <Link to={`/categoria/${categoria.nombre.toLowerCase()}`}>
              {categoria.nombre}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}