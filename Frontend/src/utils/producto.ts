import type { Producto } from "@/types/product";

export function getProductoImgUrl(producto: Producto): string {
  if (producto.imgProd) {
    return `http://localhost:8080/uploads/productos/${producto.imgProd}`;
  }
  return "/img/placeholder.webp";
}
