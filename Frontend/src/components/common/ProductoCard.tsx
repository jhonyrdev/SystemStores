import { memo } from "react";
import type { Producto } from "@/types/product";
import { getProductoImgUrl } from "@/utils/producto";

type ProductoCardProps = {
  producto: Producto;
  onClick: () => void;
  enOferta?: boolean;
};

const ProductoCard = memo(
  ({ producto, onClick, enOferta = false }: ProductoCardProps) => {
    const precio = parseFloat(
      String(producto.precio)
        .replace(/[^0-9,.-]+/g, "")
        .replace(/^\.*/, "")
        .replace(",", ".")
    );

    return (
      <div
        onClick={onClick}
        className="min-w-[200px] sm:min-w-[210px] md:min-w-[225px] items-center flex-shrink-0"
      >
        <div className="relative bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer transition hover:shadow-md">
          {enOferta && (
            <span className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
              Oferta
            </span>
          )}

          <img
            src={getProductoImgUrl(producto)}
            alt={producto.nombre}
            loading="lazy"
            className="w-full h-36 object-contain p-4"
          />

          <div className="px-4 pb-4">
            <h6 className="text-sm font-semibold text-center mb-2">
              {producto.nombre}
            </h6>

            <div className="flex items-center justify-between">
              <div>
                {enOferta ? (
                  <>
                    <div className="text-xs text-gray-400 line-through">
                      S/ {precio.toFixed(2)}
                    </div>

                    <div className="text-lg font-bold text-gray-800">
                      S/ {(precio * 0.8).toFixed(2)}
                    </div>
                  </>
                ) : (
                  <div className="text-lg font-bold text-gray-800">
                    S/ {precio.toFixed(2)}
                  </div>
                )}
              </div>

              <button className="bg-[#a51884] text-white p-2 rounded-full border border-[#a51884] hover:bg-[#8d136e] transition">
                <i className="fa-solid fa-plus text-sm"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

export default ProductoCard;
