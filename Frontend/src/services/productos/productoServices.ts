import type { Producto, ProductoFormData } from "@/types/product";
import api from "@/utils/axiomInstance";

export async function listarProductos(): Promise<Producto[]> {
  try {
    const res = await api.get<Producto[]>("/api/productos");
    return res.data;
  } catch (error: unknown) {
    console.error("Error al cargar productos:", error);
    throw new Error("Error al cargar productos");
  }
}

export async function registrarProducto(data: ProductoFormData): Promise<Producto> {
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
      console.error("Error al registrar producto:", error.message);
      throw new Error(error.message || "Error al registrar producto");
    }
    throw new Error("Error al registrar producto");
  }
}

export async function actualizarProducto(id: number, data: ProductoFormData): Promise<Producto> {
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
      console.error("Error al actualizar producto:", error.message);
      throw new Error(error.message || "Error al actualizar producto");
    }
    throw new Error("Error al actualizar producto");
  }
}

// Eliminar producto
export async function eliminarProducto(id: number): Promise<{ message: string }> {
  try {
    const res = await api.delete<{ message: string }>(`/api/productos/${id}`);
    return res.data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error al eliminar producto:", error.message);
      throw new Error(error.message || "Error al eliminar producto");
    }
    throw new Error("Error al eliminar producto");
  }
}
