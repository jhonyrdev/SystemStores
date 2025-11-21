import type { Producto, ProductoFormData } from "@/types/product";
import api, { baseURL, TOKEN_KEY } from "@/utils/axiomInstance";

export async function listarProductos(): Promise<Producto[]> {
  try {
    const res = await api.get<Producto[]>("/api/productos");
    return res.data;
  } catch {
    throw new Error("Error al cargar productos");
  }
}

export async function registrarProducto(
  data: ProductoFormData
): Promise<Producto> {
  try {
    const formData = new FormData();
    formData.append("nomProd", data.nomProd);
    formData.append("categoria", data.categoria);
    formData.append("subcategoria", data.subcategoria);
    formData.append("precioProd", data.precioProd.toString());
    formData.append("cantProd", data.cantProd.toString());

    if (data.marca) formData.append("marca", data.marca);
    if (data.unidad) formData.append("unidad", data.unidad);
    if (data.imagen) formData.append("imagen", data.imagen);

    const res = await api.post<Producto>("/api/productos", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return res.data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(error.message || "Error al registrar producto");
    }
    throw new Error("Error al registrar producto");
  }
}

export async function actualizarProducto(
  id: number,
  data: ProductoFormData
): Promise<Producto> {
  try {
    const formData = new FormData();
    formData.append("nomProd", data.nomProd);
    formData.append("categoria", data.categoria);
    formData.append("subcategoria", data.subcategoria);
    formData.append("precioProd", data.precioProd.toString());
    formData.append("cantProd", data.cantProd.toString());

    if (data.marca) formData.append("marca", data.marca);
    if (data.unidad) formData.append("unidad", data.unidad);
    if (data.imagen) formData.append("imagen", data.imagen);

    const res = await api.put<Producto>(`/api/productos/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return res.data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(error.message || "Error al actualizar producto");
    }
    throw new Error("Error al actualizar producto");
  }
}

// Eliminar producto
export type DeleteResult =
  | { ok: true; data?: unknown }
  | { ok: false; status?: number; message?: string; data?: unknown };

export async function eliminarProducto(id: number): Promise<DeleteResult> {
  try {
    // Use Fetch API for DELETE to avoid browser console error stack traces
    const url = `${baseURL}/api/productos/${id}`;
    const token = localStorage.getItem(TOKEN_KEY);
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) headers.Authorization = `Bearer ${token}`;

    const resp = await fetch(url, {
      method: "DELETE",
      headers,
      credentials: "include",
    });

    const text = await resp.text();
    let data: unknown;
    try {
      data = text ? JSON.parse(text) : undefined;
    } catch {
      data = text;
    }

    if (resp.ok) {
      return { ok: true, data };
    }

    // Non-ok status: return structured failure
    const message =
      typeof data === "string"
        ? data
        : typeof data === "object" && data
        ? JSON.stringify(data)
        : undefined;
    return { ok: false, status: resp.status, message, data };
  } catch (error: unknown) {
    if (error instanceof Error) return { ok: false, message: error.message };
    return { ok: false, message: "Error al eliminar producto" };
  }
}
