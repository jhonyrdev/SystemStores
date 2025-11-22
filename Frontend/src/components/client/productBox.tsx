import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Producto } from "@/types/product";
import { getProductoImgUrl } from "@/utils/producto";
import useCarrito from "@/hooks/useCarrito";

type Props = {
  show: boolean;
  onClose: () => void;
  producto: Producto | null;
  enOferta?: boolean;
};

const ProductBox: React.FC<Props> = ({
  show,
  onClose,
  producto,
  enOferta = false,
}) => {
  const [cantidad, setCantidad] = useState(1);
  const { addItem } = useCarrito();

  if (!producto) return null;

  const precioBase =
    parseFloat(
      String(producto.precio)
        .replace(/[^0-9,.-]+/g, "")
        .replace(/^\.*/, "")
        .replace(",", ".")
    ) || 0;

  const precioFinal = enOferta ? precioBase * 0.8 : precioBase;
  const total = (cantidad * precioFinal).toFixed(2);

  const agregarProducto = () => {
    if (!producto) return;

    addItem({
      id: String(producto.idProd ?? producto.nombre ?? ""),
      name: producto.nombre,
      quantity: cantidad,
      price: precioFinal,
    });

    onClose();
  };

  return (
    <Dialog open={show} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full p-6 md:p-8 max-h-screen overflow-hidden">
        <div className="grid md:grid-cols-2 gap-6 h-full">
          {/* Columna izquierda: Imagen */}
          <div className="flex justify-center items-center h-full">
            <img
              src={getProductoImgUrl(producto)}
              alt={producto.nombre}
              loading="lazy"
              className="rounded-xl object-contain h-auto w-full max-h-[40vh]"
              onError={(e) => (e.currentTarget.src = "/img/placeholder.webp")}
            />
          </div>

          {/* Columna derecha: Info */}
          <div className="flex flex-col justify-between h-full">
            {/* Título y descripción */}
            <div>
              <DialogHeader className="mb-4">
                <DialogTitle className="text-xl font-semibold">
                  {producto.nombre}
                </DialogTitle>
                <DialogDescription>
                  Descripción breve o promoción del producto.
                </DialogDescription>
              </DialogHeader>
            </div>

            {/* Controles: cantidad + agregar */}
            <div className="flex flex-col min-[372px]:flex-row gap-3 items-stretch">
              {/* Selector de cantidad */}
              <div className="flex justify-center items-center px-2 shrink-0 w-auto">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCantidad((prev) => Math.max(1, prev - 1))}
                  className="w-8 text-center border-1 rounded-full"
                  disabled={cantidad <= 1}
                >
                  −
                </Button>

                <Input
                  readOnly
                  value={cantidad}
                  className="w-8 text-center border-0"
                />

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCantidad((prev) => Math.min(10, prev + 1))}
                  className="w-8 text-center border-1 rounded-full"
                  disabled={cantidad >= 10}
                >
                  +
                </Button>
              </div>

              {/* Botón de agregar */}
              <div className="flex-1">
                <Button className="w-full h-full" onClick={agregarProducto}>
                  Agregar - S/ {total}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductBox;
