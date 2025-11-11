import type { Producto } from "@/types/product";

export function getProductoImgUrl(producto: Producto): string {
  return producto.imgProd
    ? `http://localhost:8080/uploads/productos/${producto.imgProd}`
    : "/img/placeholder.webp";
}
