import type { Producto } from "@/types/product";
import { baseURL } from "@/services/api/axiosInstance";

export function getProductoImgUrl(producto: Producto): string {
  const apiBase = baseURL.replace(/\/$/, "");
  return producto.imgProd
    ? `${apiBase}/uploads/productos/${producto.imgProd}`
    : "/img/placeholder.webp";
}
