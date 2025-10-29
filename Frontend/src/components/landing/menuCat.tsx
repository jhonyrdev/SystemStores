import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Link } from "react-router-dom";

interface Categoria {
  id: number;
  nombre: string;
}

interface MobileCategoriasProps {
  categorias: Categoria[];
  onSelect?: () => void;
}

export default function MobileCategorias({
  categorias,
  onSelect,
}: MobileCategoriasProps) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        className="flex items-center justify-between w-full text-primary hover:text-primary/80"
        onClick={() => setOpen(!open)}
      >
        <span>Categorías</span>
        {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      {open && (
        <ul className="mt-2 pl-4 space-y-1">
          {categorias.map((cat) => (
            <li key={cat.nombre}>
              <Link
                to={`/categoria/${cat.nombre.toLowerCase()}`}
                className="block px-2 py-1 text-sm text-primary hover:bg-gray-100 rounded"
                onClick={onSelect}
              >
                {cat.nombre}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}