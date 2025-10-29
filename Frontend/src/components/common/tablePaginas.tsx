import { Button } from "@components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMediaQuery } from "usehooks-ts";

interface TablePaginasProps {
  page: number;
  totalPages: number;
  setPage: (page: number) => void;
  totalItems: number;
  perPage: number;
}

const TablePaginas = ({
  page,
  totalPages,
  setPage,
  totalItems,
  perPage,
}: TablePaginasProps) => {
  const start = (page - 1) * perPage + 1;
  const end = Math.min(page * perPage, totalItems);

  const isMobile = useMediaQuery("(max-width: 640px)");

  //Máximo de botones según el dispositivo
  const maxVisible = isMobile ? 2 : 5;

  // Rango de páginas visibles
  const startPage = Math.max(1, page - Math.floor(maxVisible / 2));
  const endPage = Math.min(totalPages, startPage + maxVisible - 1);

  const visiblePages = Array.from(
    { length: endPage - startPage + 1 },
    (_, i) => startPage + i
  );

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-muted-foreground mt-2">
      <p>
        Mostrando {start}-{end} de {totalItems} resultados
      </p>

      <div className="flex items-center gap-1 mt-2 sm:mt-0">
        {/* Anterior */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage(Math.max(1, page - 1))}
          disabled={page === 1}
          className="flex items-center gap-1"
        >
          <ChevronLeft className="h-4 w-4 block sm:hidden" />
          <span className="hidden sm:inline">Anterior</span>
        </Button>

        {/* Botones de página (limitados) */}
        {visiblePages.map((p) => (
          <Button
            key={p}
            variant={page === p ? "default" : "outline"}
            size="sm"
            onClick={() => setPage(p)}
            className="bg-secundario text-black"
          >
            {p}
          </Button>
        ))}

        {/* Siguiente */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className="flex items-center gap-1"
        >
          <ChevronRight className="h-4 w-4 block sm:hidden" />
          <span className="hidden sm:inline">Siguiente</span>
        </Button>
      </div>
    </div>
  );
};

export default TablePaginas;
