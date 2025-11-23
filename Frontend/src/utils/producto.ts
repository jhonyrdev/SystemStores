import type { Producto } from "@/types/product";
import { baseURL } from "@/services/api/axiosInstance";

// Accept either a Producto object or a direct image string (filename or full URL)
export function getProductoImgUrl(
  productoOrImg: Producto | string | undefined
): string {
  const apiBase = baseURL.replace(/\/$/, "");
  const imageBase = (import.meta.env.VITE_IMAGE_BASE_URL as string) || apiBase;

  const img =
    typeof productoOrImg === "string" ? productoOrImg : productoOrImg?.imgProd;

  if (!img) return "/img/placeholder.webp";

  // If img is already a full URL, return it as-is (useful for Cloudinary links)
  if (/^https?:\/\//i.test(img)) return img;

  return `${imageBase.replace(/\/$/, "")}/uploads/productos/${img}`;
}
